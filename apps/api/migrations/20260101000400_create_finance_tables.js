/**
 * Every workspace-owned table has the same two columns. A personal row has
 * organization_id NULL. A team row keeps user_id only to record who created it,
 * so user_id is SET NULL on delete: removing a person must not erase team records.
 */
function workspaceColumns(table) {
  table.integer('user_id').unsigned().references('users.id').onDelete('SET NULL');
  table.integer('organization_id').unsigned().references('organizations.id').onDelete('CASCADE');
  table.index(['organization_id', 'user_id']);
}

export async function up(knex) {
  await knex.schema.createTable('budgets', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    workspaceColumns(table);
    // MySQL unique indexes ignore NULLs, so "u12" or "o7" enforces one budget per workspace per month.
    table.string('scope_key', 20).notNullable();
    table.date('month').notNullable();
    table.decimal('income', 14, 2).notNullable();
    table.decimal('savings_goal', 14, 2).notNullable().defaultTo(0);
    table.timestamps(true, true);
    table.unique(['scope_key', 'month']);
  });

  await knex.schema.createTable('budget_items', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.integer('budget_id').unsigned().notNullable().references('budgets.id').onDelete('CASCADE');
    table.string('category_name', 100).notNullable();
    table.decimal('amount', 14, 2).notNullable();
    table.timestamps(true, true);
    table.unique(['budget_id', 'category_name']);
  });

  await knex.schema.createTable('expenses', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    workspaceColumns(table);
    table.string('category_name', 100).notNullable();
    table.decimal('amount', 14, 2).notNullable();
    table.string('description', 255).notNullable().defaultTo('');
    table.date('spent_on').notNullable();
    table.timestamps(true, true);
    table.index('spent_on');
  });

  await knex.schema.createTable('transactions', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    workspaceColumns(table);
    table.enum('type', ['sent', 'received', 'pending']).notNullable();
    table.date('date').notNullable();
    table.decimal('amount', 14, 2).notNullable();
    table.string('sender', 100).notNullable();
    table.string('receiver', 100).notNullable();
    table.string('method', 60).notNullable();
    table.string('description', 255).notNullable().defaultTo('');
    table.timestamps(true, true);
    table.index('date');
  });

  await knex.schema.createTable('reminders', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    workspaceColumns(table);
    table.string('title', 255).notNullable();
    table.date('due_date').notNullable();
    table.enum('status', ['pending', 'done']).notNullable().defaultTo('pending');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('notes', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    workspaceColumns(table);
    table.text('body').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  for (const name of ['notes', 'reminders', 'transactions', 'expenses', 'budget_items', 'budgets']) {
    await knex.schema.dropTable(name);
  }
}
