export async function up(knex) {
  await knex.schema.createTable('split_contacts', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.integer('owner_id').unsigned().notNullable().references('users.id').onDelete('CASCADE');
    table.integer('contact_user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['owner_id', 'contact_user_id']);
  });

  await knex.schema.createTable('split_groups', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.string('name', 50).notNullable();
    table.integer('created_by').unsigned().notNullable().references('users.id').onDelete('CASCADE');
    table.timestamps(true, true);
    table.unique(['created_by', 'name']);
  });

  await knex.schema.createTable('split_group_members', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.integer('group_id').unsigned().notNullable().references('split_groups.id').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE');
    table.decimal('balance', 14, 2).notNullable().defaultTo(0);
    table.unique(['group_id', 'user_id']);
  });

  await knex.schema.createTable('split_activity', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.integer('group_id').unsigned().notNullable().references('split_groups.id').onDelete('CASCADE');
    table.string('description', 255).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  for (const name of ['split_activity', 'split_group_members', 'split_groups', 'split_contacts']) {
    await knex.schema.dropTable(name);
  }
}
