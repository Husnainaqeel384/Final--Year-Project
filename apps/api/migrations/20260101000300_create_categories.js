// The app cannot be used without categories, so these ship with the schema rather than as demo data.
const DEFAULT_CATEGORIES = {
  'Home Expenses': ['Mortgage/Rent', 'Electricity', 'Gas/Oil', 'Water/Sewer/Trash', 'Phone', 'Internet', 'Cable', 'Maintenance'],
  'Daily Living': ['Groceries', 'Personal Supplies', 'Clothing', 'Dining Out', 'Salon/Barber'],
  Transportation: ['Fuel', 'Bus/Taxi/Train Fare', 'Vehicle Payments', 'Repairs'],
  Entertainment: ['Activities', 'Books', 'Games', 'Hobbies', 'Sports'],
  Health: ['Doctor', 'Medicines', 'Health Club Dues'],
  Children: ['School Fee', 'School Supplies', 'Toys/Games', 'Medical'],
  Education: ['Tuition', 'Courses'],
  Insurance: ['Auto Insurance', 'Health Insurance', 'Life Insurance', 'Home Insurance'],
  Savings: ['Emergency Fund', 'Retirement Fund', 'Investments'],
  Subscriptions: ['Streaming', 'Software', 'Memberships'],
  Obligations: ['Loans', 'Credit Card Debt', 'Taxes', 'Legal Fees'],
  'Charity and Gifts': ['Gifts Given', 'Charitable Donations', 'Religious Donations'],
  Business: ['Payroll', 'Office Rent', 'Marketing', 'Equipment', 'Contractors', 'Travel'],
  Miscellaneous: ['Bank Fees', 'Postage', 'Pet Care', 'Other'],
};

export async function up(knex) {
  await knex.schema.createTable('categories', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.string('name', 100).notNullable().unique();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('subcategories', (table) => {
    table.engine('InnoDB');
    table.increments('id');
    table.integer('category_id').unsigned().notNullable().references('categories.id').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.timestamps(true, true);
    table.unique(['category_id', 'name']);
  });

  for (const [name, subcategories] of Object.entries(DEFAULT_CATEGORIES)) {
    const [categoryId] = await knex('categories').insert({ name });
    await knex('subcategories').insert(
      subcategories.map((subcategory) => ({ category_id: categoryId, name: subcategory })),
    );
  }
}

export async function down(knex) {
  await knex.schema.dropTable('subcategories');
  await knex.schema.dropTable('categories');
}
