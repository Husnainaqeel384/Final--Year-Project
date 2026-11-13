export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.string('first_name', 50).notNullable();
    table.string('last_name', 50).notNullable();
    table.string('username', 30).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 100).notNullable();
    table.enum('role', ['user', 'admin']).notNullable().defaultTo('user');
    table.string('avatar', 255);
    table.string('currency', 3).notNullable().defaultTo('USD');
    // Raising this number instantly invalidates every session issued before it.
    table.integer('token_version').unsigned().notNullable().defaultTo(0);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('password_reset_tokens', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE');
    // Only a hash is stored, so a database leak does not expose usable reset links.
    table.string('token_hash', 64).notNullable().unique();
    table.datetime('expires_at').notNullable();
    table.datetime('used_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTable('password_reset_tokens');
  await knex.schema.dropTable('users');
}
