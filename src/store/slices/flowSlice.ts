import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NodeObject, Connection, ContentNode } from '../../types';

interface FlowState {
  nodes: NodeObject[];
  connections: Connection[];
  selectedNodeIds: string[];
}

const initialState: FlowState = {
  nodes: [],
  connections: [],
  selectedNodeIds: [],
};

export const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
    addNode: (state, action: PayloadAction<NodeObject>) => {
      state.nodes.push(action.payload);
    },
    updateNodePosition: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
      const node = state.nodes.find((n: NodeObject) => n.id === action.payload.id);
      if (node) {
        node.position = { x: action.payload.x, y: action.payload.y };
      }
    },
    updateNodeSize: (state, action: PayloadAction<{ id: string; width: number; height: number }>) => {
      const node = state.nodes.find((n: NodeObject) => n.id === action.payload.id);
      if (node) {
        node.size = { width: action.payload.width, height: action.payload.height };
      }
    },
    updateNodeContent: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const node = state.nodes.find((n) => n.id === action.payload.id) as ContentNode;
      if (node) {
        node.content = action.payload.content;
      }
    },
    deleteNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter((n: NodeObject) => n.id !== action.payload);
      state.selectedNodeIds = state.selectedNodeIds.filter(id => id !== action.payload);
      state.connections = state.connections.filter(
        conn => conn.sourceNodeId !== action.payload && conn.targetNodeId !== action.payload
      );
    },
    selectNode: (state, action: PayloadAction<{ nodeId: string; multiSelect: boolean }>) => {
      if (action.payload.multiSelect) {
        const index = state.selectedNodeIds.indexOf(action.payload.nodeId);
        if (index === -1) {
          state.selectedNodeIds.push(action.payload.nodeId);
        } else {
          state.selectedNodeIds.splice(index, 1);
        }
      } else {
        state.selectedNodeIds = [action.payload.nodeId];
      }
    },
    clearSelection: (state) => {
      state.selectedNodeIds = [];
    },
    deleteSelectedNodes: (state) => {
      state.nodes = state.nodes.filter((n: NodeObject) => !state.selectedNodeIds.includes(n.id));
      state.selectedNodeIds = [];
    },
  }
});

export const {
  addNode,
  updateNodePosition,
  updateNodeSize,
  updateNodeContent,
  deleteNode,
  selectNode,
  clearSelection,
  deleteSelectedNodes,
} = flowSlice.actions;

export default flowSlice.reducer; 