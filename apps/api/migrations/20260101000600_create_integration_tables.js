export async function up(knex) {
  await knex.schema.createTable('integration_feeds', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE');
    table.integer('organization_id').unsigned().references('organizations.id').onDelete('CASCADE');
    table.string('scope_key', 20).notNullable();
    table.enum('kind', ['calendar', 'sheets']).notNullable();
    // The link is shown once. Only its hash is kept, like a password.
    table.string('token_hash', 64).notNullable().unique();
    table.datetime('last_used_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['scope_key', 'kind']);
  });

  await knex.schema.createTable('webhooks', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.integer('user_id').unsigned().references('users.id').onDelete('SET NULL');
    table.integer('organization_id').unsigned().references('organizations.id').onDelete('CASCADE');
    table.string('name', 60).notNullable();
    table.enum('provider', ['slack', 'discord', 'generic']).notNullable();
    table.string('url', 500).notNullable();
    table.string('secret', 64).notNullable();
    table.json('events').notNullable();
    table.integer('last_status');
    table.datetime('last_delivered_at');
    table.timestamps(true, true);
    table.index(['organization_id', 'user_id']);
  });
}

export async function down(knex) {
  await knex.schema.dropTable('webhooks');
  await knex.schema.dropTable('integration_feeds');
}
