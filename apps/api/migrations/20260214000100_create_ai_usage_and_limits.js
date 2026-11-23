/**
 * AI requests spend the person's own credit, so each one sent to a provider is
 * recorded, and people can cap how many they make in a day and in a week.
 *
 * `ai_limits` is kept apart from `ai_settings`, so removing a key to switch
 * provider doesn't throw away the limits someone chose.
 * `ai_usage.provider` is a plain string, so a new provider needs no change here.
 */
export async function up(knex) {
  // Guarded so a run interrupted part-way (for example by a dev-server restart) can finish.
  if (!(await knex.schema.hasTable('ai_limits'))) {
    await knex.schema.createTable('ai_limits', (table) => {
      table.engine('InnoDB');
      table.integer('user_id').unsigned().primary().references('users.id').onDelete('CASCADE');
      table.integer('daily_limit').unsigned();
      table.integer('weekly_limit').unsigned();
      table.timestamps(true, true);
    });
  }

  if (!(await knex.schema.hasTable('ai_usage'))) {
    await knex.schema.createTable('ai_usage', (table) => {
      table.engine('InnoDB');
      table.bigIncrements('id');
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE');
      // Which workspace it was for, kept for the person's own records only.
      table.integer('organization_id').unsigned().references('organizations.id').onDelete('SET NULL');
      table.enum('feature', ['receipt', 'insights']).notNullable();
      table.string('provider', 20).notNullable();
      table.string('model', 100).notNullable();
      // Null while the request is in flight; then whether the provider answered usefully.
      table.boolean('ok');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.index(['user_id', 'created_at']);
    });
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('ai_usage');
  await knex.schema.dropTableIfExists('ai_limits');
}
