import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { flowSlice } from './slices/flowSlice';
import undoable from 'redux-undo';

const persistConfig = {
  key: 'root',
  storage,
};

// 将 flowSlice reducer 包装在 undoable 中
const undoableFlowReducer = undoable(flowSlice.reducer, {
  limit: 50, // 限制历史记录数量
  filter: (action) => {
    // 只有这些 action 会被记录到历史中
    const actionsToTrack = ['flow/addNode', 'flow/updateNodePosition', 'flow/deleteNode', 'flow/updateNodeContent'];
    return actionsToTrack.includes(action.type);
  },
});

const persistedReducer = persistReducer(persistConfig, undoableFlowReducer);

export const store = configureStore({
  reducer: {
    flow: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略 redux-persist 和 redux-undo 的 action
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', '@@redux-undo/UNDO', '@@redux-undo/REDO'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export * from './slices/flowSlice'; 