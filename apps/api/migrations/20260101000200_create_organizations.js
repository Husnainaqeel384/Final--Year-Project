const ROLES = ['owner', 'admin', 'member'];

export async function up(knex) {
  await knex.schema.createTable('organizations', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.string('name', 80).notNullable();
    table.string('currency', 3).notNullable().defaultTo('USD');
    table.integer('owner_id').unsigned().notNullable().references('users.id');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('organization_members', (table) => {
    table.engine('InnoDB');
    table.integer('organization_id').unsigned().notNullable().references('organizations.id').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE');
    table.enum('role', ROLES).notNullable().defaultTo('member');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.primary(['organization_id', 'user_id']);
  });

  await knex.schema.createTable('organization_invitations', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.integer('organization_id').unsigned().notNullable().references('organizations.id').onDelete('CASCADE');
    table.string('email', 255).notNullable();
    table.enum('role', ROLES).notNullable().defaultTo('member');
    table.string('token_hash', 64).notNullable().unique();
    table.integer('invited_by').unsigned().references('users.id').onDelete('SET NULL');
    table.datetime('expires_at').notNullable();
    table.datetime('accepted_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['organization_id', 'email']);
  });
}

export async function down(knex) {
  await knex.schema.dropTable('organization_invitations');
  await knex.schema.dropTable('organization_members');
  await knex.schema.dropTable('organizations');
}
