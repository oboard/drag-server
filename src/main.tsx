// 导入polyfill
import './polyfills';

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { EditorProvider } from './contexts/EditorContext';
import { Toaster } from 'react-hot-toast';
import App from "./App";
import './App.css';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <EditorProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'bg-base-200 text-base-content',
              duration: 2000,
            }}
          />
        </EditorProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);
