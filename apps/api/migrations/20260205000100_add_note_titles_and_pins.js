/**
 * Notes get an optional title and can be pinned to the top of the list.
 * Existing notes keep working as untitled, unpinned notes.
 */
export async function up(knex) {
  // Guarded so a run interrupted part-way (for example by a dev-server restart) can finish.
  if (!(await knex.schema.hasColumn('notes', 'title'))) {
    await knex.schema.alterTable('notes', (table) => {
      table.string('title', 120).after('organization_id');
    });
  }
  if (!(await knex.schema.hasColumn('notes', 'pinned'))) {
    await knex.schema.alterTable('notes', (table) => {
      table.boolean('pinned').notNullable().defaultTo(false).after('body');
    });
  }
}

export async function down(knex) {
  await knex.schema.alterTable('notes', (table) => {
    table.dropColumn('pinned');
    table.dropColumn('title');
  });
}
