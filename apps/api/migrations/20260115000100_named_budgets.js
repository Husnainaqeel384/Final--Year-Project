/**
 * Budgets get a name, and a month may now hold several of them (a household
 * budget and a trip budget, for example). Each expense records which budget
 * it counts toward, so the same purchase is never counted twice.
 */
const TRAVEL = ['Flights', 'Hotels', 'Local Transport', 'Sightseeing', 'Travel Insurance'];

export async function up(knex) {
  await knex.schema.alterTable('budgets', (table) => {
    table.string('name', 80).notNullable().defaultTo('Monthly budget').after('scope_key');
  });

  await knex.schema.alterTable('budgets', (table) => {
    table.index(['scope_key', 'month']);
    table.dropUnique(['scope_key', 'month']);
    table.unique(['scope_key', 'month', 'name']);
  });

  await knex.schema.alterTable('expenses', (table) => {
    table.integer('budget_id').unsigned().references('budgets.id').onDelete('SET NULL').after('organization_id');
    table.index(['budget_id', 'category_name']);
  });

  // Until now a workspace had at most one budget a month, so every existing
  // expense maps to exactly one budget (or none).
  await knex.raw(`
    UPDATE expenses e
    JOIN budgets b
      ON b.month = DATE_FORMAT(e.spent_on, '%Y-%m-01')
     AND (
          (e.organization_id IS NULL AND b.organization_id IS NULL AND b.user_id = e.user_id)
       OR (e.organization_id IS NOT NULL AND b.organization_id = e.organization_id)
     )
    SET e.budget_id = b.id
    WHERE e.budget_id IS NULL
  `);

  // Trip budgets need travel categories. Skipped if an administrator already added one.
  const existing = await knex('categories').where({ name: 'Travel' }).first('id');
  if (!existing) {
    const [categoryId] = await knex('categories').insert({ name: 'Travel' });
    await knex('subcategories').insert(TRAVEL.map((name) => ({ category_id: categoryId, name })));
  }
}

/** Fails if a month already holds two budgets, because the old rule can't represent that. */
export async function down(knex) {
  await knex.schema.alterTable('expenses', (table) => {
    table.dropForeign(['budget_id']);
    table.dropIndex(['budget_id', 'category_name']);
    table.dropColumn('budget_id');
  });
  await knex.schema.alterTable('budgets', (table) => {
    table.dropUnique(['scope_key', 'month', 'name']);
    table.unique(['scope_key', 'month']);
    table.dropIndex(['scope_key', 'month']);
    table.dropColumn('name');
  });
}
