/**
 * Adds OpenAI (ChatGPT) to the AI providers a person can connect.
 * MODIFY is safe to run twice, so an interrupted start can simply run it again.
 */
const TABLES = ['ai_settings', 'ai_insights'];

export async function up(knex) {
  for (const table of TABLES) {
    await knex.raw("ALTER TABLE ?? MODIFY provider ENUM('claude', 'gemini', 'deepseek', 'openai') NOT NULL", [table]);
  }
}

// Fails while any row still uses OpenAI, which is the safe outcome: nothing is dropped silently.
export async function down(knex) {
  for (const table of TABLES) {
    await knex.raw("ALTER TABLE ?? MODIFY provider ENUM('claude', 'gemini', 'deepseek') NOT NULL", [table]);
  }
}
