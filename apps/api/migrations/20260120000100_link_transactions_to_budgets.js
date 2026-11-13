/**
 * Transactions can point at a budget. A "sent" transaction with a category is
 * mirrored as an expense of that budget; the expense records which transaction
 * it came from and is removed with it, so money is never counted twice.
 * A "received" transaction linked to a budget counts as income received.
 */
export async function up(knex) {
  await knex.schema.alterTable('transactions', (table) => {
    table.integer('budget_id').unsigned().references('budgets.id').onDelete('SET NULL').after('organization_id');
    table.string('category_name', 100).after('budget_id');
    table.index(['budget_id', 'type']);
  });

  await knex.schema.alterTable('expenses', (table) => {
    table
      .integer('transaction_id')
      .unsigned()
      .unique()
      .references('transactions.id')
      .onDelete('CASCADE')
      .after('budget_id');
  });
}

export async function down(knex) {
  await knex.schema.alterTable('expenses', (table) => {
    table.dropForeign(['transaction_id']);
    table.dropUnique(['transaction_id']);
    table.dropColumn('transaction_id');
  });
  await knex.schema.alterTable('transactions', (table) => {
    table.dropForeign(['budget_id']);
    table.dropIndex(['budget_id', 'type']);
    table.dropColumn('budget_id');
    table.dropColumn('category_name');
  });
}
