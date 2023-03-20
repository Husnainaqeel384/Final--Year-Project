import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'
import store from './store';
import { ContectProvider } from './context/ContextProvider';
import { Provider } from 'react-redux'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ContectProvider>
      <Provider store={store}>
      <App />
      </Provider>
    </ContectProvider>
  </React.StrictMode>
);

