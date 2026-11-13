/**
 * Reminders become bills: an optional amount and category, a repeat schedule,
 * and a link to the payment that settled them.
 *
 * A repeating reminder is a chain of rows. Completing one closes it and opens
 * the next with `previous_id` pointing back, so every payment keeps its own
 * history row and the calendar feed needs no recurrence rules.
 * `anchor_day` remembers the intended day of the month, so a bill due on the
 * 31st returns to the 31st after a short month instead of drifting to the 28th.
 */
export async function up(knex) {
  await knex.schema.alterTable('reminders', (table) => {
    table.decimal('amount', 14, 2).after('title');
    table.string('category_name', 100).after('amount');
    table.enum('frequency', ['none', 'weekly', 'monthly', 'yearly']).notNullable().defaultTo('none').after('due_date');
    table.tinyint('anchor_day').unsigned().after('frequency');
    table.string('note', 255).after('anchor_day');
    table.date('completed_on').after('status');
    table.integer('transaction_id').unsigned().references('transactions.id').onDelete('SET NULL').after('completed_on');
    table.integer('previous_id').unsigned().references('reminders.id').onDelete('SET NULL').after('transaction_id');
    table.index(['status', 'due_date']);
  });

  // Reminders finished before this migration have no completion date; the last update is the best record of it.
  await knex('reminders').where({ status: 'done' }).update({ completed_on: knex.raw('DATE(updated_at)') });
}

export async function down(knex) {
  await knex.schema.alterTable('reminders', (table) => {
    table.dropForeign(['transaction_id']);
    table.dropForeign(['previous_id']);
    table.dropIndex(['status', 'due_date']);
    for (const column of ['amount', 'category_name', 'frequency', 'anchor_day', 'note', 'completed_on', 'transaction_id', 'previous_id']) {
      table.dropColumn(column);
    }
  });
}
