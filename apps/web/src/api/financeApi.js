import { client } from './client';

const data = (res) => res.data.data;

export const fetchDashboard = (month) => client.get('/dashboard', { params: { month } }).then(data);

export const fetchBudgets = (params) => client.get('/budgets', { params }).then(data);
export const fetchBudgetYears = () => client.get('/budgets/years').then(data);
export const fetchBudget = (id) => client.get(`/budgets/${id}`).then(data);
export const createBudget = (budget) => client.post('/budgets', budget).then(data);
export const updateBudget = (id, budget) => client.patch(`/budgets/${id}`, budget).then(data);
export const deleteBudget = (id) => client.delete(`/budgets/${id}`);
export const addBudgetItems = (id, items) =>
  client.post(`/budgets/${id}/items`, { items }).then(data);
export const updateBudgetItem = (id, itemId, amount) =>
  client.patch(`/budgets/${id}/items/${itemId}`, { amount }).then(data);
export const deleteBudgetItem = (id, itemId) => client.delete(`/budgets/${id}/items/${itemId}`);

export const fetchExpenseSummary = (params) => client.get('/expenses/summary', { params }).then(data);
export const fetchExpenses = (params) => client.get('/expenses', { params }).then(data);
export const createExpense = (expense) => client.post('/expenses', expense).then(data);
/** One receipt split by category: { spentOn, budgetId, items: [{ categoryName, amount, description }] }, saved together. */
export const createExpenses = (batch) => client.post('/expenses/batch', batch).then(data);
export const updateExpense = (id, expense) => client.patch(`/expenses/${id}`, expense).then(data);
export const deleteExpense = (id) => client.delete(`/expenses/${id}`);

export const fetchTransactions = (params) => client.get('/transactions', { params }).then(data);
export const createTransaction = (item) => client.post('/transactions', item).then(data);
export const updateTransaction = (id, item) => client.patch(`/transactions/${id}`, item).then(data);
export const deleteTransaction = (id) => client.delete(`/transactions/${id}`);

export const fetchReportMonths = () => client.get('/reports/months').then(data);
export const fetchReport = (month) => client.get(`/reports/${month}`).then(data);

export const fetchCategories = () => client.get('/categories').then(data);
export const createCategory = (name) => client.post('/categories', { name }).then(data);
export const updateCategory = (id, name) => client.patch(`/categories/${id}`, { name }).then(data);
export const deleteCategory = (id) => client.delete(`/categories/${id}`);
export const createSubcategory = (categoryId, name) =>
  client.post(`/categories/${categoryId}/subcategories`, { name }).then(data);
export const updateSubcategory = (id, name) =>
  client.patch(`/categories/subcategories/${id}`, { name }).then(data);
export const deleteSubcategory = (id) => client.delete(`/categories/subcategories/${id}`);
