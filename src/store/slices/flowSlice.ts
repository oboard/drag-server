import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Node, Connection } from '../../types';

interface FlowState {
  nodes: Node[];
  connections: Connection[];
}

const initialState: FlowState = {
  nodes: [],
  connections: []
};

export const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
    addNode: (state, action: PayloadAction<Node>) => {
      state.nodes.push(action.payload);
    },
    updateNodePosition: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
      const node = state.nodes.find(n => n.id === action.payload.id);
      if (node) {
        node.position = { x: action.payload.x, y: action.payload.y };
      }
    },
    deleteNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter(node => node.id !== action.payload);
      state.connections = state.connections.filter(
        conn => conn.sourceNodeId !== action.payload && conn.targetNodeId !== action.payload
      );
    },
  }
}); 