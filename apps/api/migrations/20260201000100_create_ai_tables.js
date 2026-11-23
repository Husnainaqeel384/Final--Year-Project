/**
 * AI features use each person's own provider key, so the app never pays for
 * someone else's requests.
 *
 * `ai_settings` holds one provider choice per person. The key is stored
 * encrypted (see src/ai/keys.js) with only its last four characters kept in
 * the clear, so the settings page can show which key is saved without
 * ever sending it back.
 *
 * `ai_insights` keeps the last explanation generated for a workspace's month,
 * so opening the report again doesn't cost another request.
 */
export async function up(knex) {
  // MySQL can't roll back CREATE TABLE, so a run cut short (for example by a dev-server
  // restart) leaves the first table behind. Skipping existing tables lets it finish.
  if (!(await knex.schema.hasTable('ai_settings'))) await knex.schema.createTable('ai_settings', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.integer('user_id').unsigned().notNullable().unique().references('users.id').onDelete('CASCADE');
    table.enum('provider', ['claude', 'gemini', 'deepseek']).notNullable();
    table.string('model', 100).notNullable();
    table.text('api_key_encrypted').notNullable();
    table.string('key_hint', 8).notNullable();
    table.timestamps(true, true);
  });

  if (!(await knex.schema.hasTable('ai_insights'))) await knex.schema.createTable('ai_insights', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    // Same ownership columns as the other workspace tables (see create_finance_tables).
    table.integer('user_id').unsigned().references('users.id').onDelete('SET NULL');
    table.integer('organization_id').unsigned().references('organizations.id').onDelete('CASCADE');
    table.string('scope_key', 20).notNullable();
    table.date('month').notNullable();
    table.enum('provider', ['claude', 'gemini', 'deepseek']).notNullable();
    table.string('model', 100).notNullable();
    table.json('content').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.unique(['scope_key', 'month']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('ai_insights');
  await knex.schema.dropTableIfExists('ai_settings');
}
