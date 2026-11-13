import { configureStore } from '@reduxjs/toolkit';

import authReducer from './features/authSlice';
import workspaceReducer from './features/workspaceSlice';
import uiReducer from './features/uiSlice';
import dashboardReducer from './features/dashboardSlice';
import budgetReducer from './features/budgetSlice';
import expenseReducer from './features/expenseSlice';
import transactionReducer from './features/transactionSlice';
import reportReducer from './features/reportSlice';
import categoryReducer from './features/categorySlice';
import reminderReducer from './features/reminderSlice';
import noteReducer from './features/noteSlice';
import splitReducer from './features/splitSlice';
import organizationReducer from './features/organizationSlice';
import adminReducer from './features/adminSlice';
import integrationReducer from './features/integrationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    ui: uiReducer,
    dashboard: dashboardReducer,
    budget: budgetReducer,
    expense: expenseReducer,
    transaction: transactionReducer,
    report: reportReducer,
    category: categoryReducer,
    reminder: reminderReducer,
    note: noteReducer,
    split: splitReducer,
    organization: organizationReducer,
    admin: adminReducer,
    integration: integrationReducer,
  },
});
