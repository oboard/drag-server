import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NodeTypes, Connection } from '../../types/index';

interface FlowState {
  nodes: NodeTypes[];
  connections: Connection[];
  selectedNodeIds: string[];
  properties: Record<string, Record<string, string | number>>;  // nodeId -> portId -> value
}

const initialState: FlowState = {
  nodes: [],
  connections: [],
  properties: {},
  selectedNodeIds: [],
};

export const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
    addNode: (state, action: PayloadAction<NodeTypes>) => {
      state.nodes.push(action.payload);
    },
    updateNodePosition: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
      const node = state.nodes.find((n: NodeTypes) => n.id === action.payload.id);
      if (node) {
        node.position = { x: action.payload.x, y: action.payload.y };
      }
    },
    updateNodeSize: (state, action: PayloadAction<{ id: string; width: number; height: number }>) => {
      const node = state.nodes.find((n: NodeTypes) => n.id === action.payload.id);
      if (node) {
        node.size = { width: action.payload.width, height: action.payload.height };
      }
    },
    updateNodeContent: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const node = state.nodes.find((n: NodeTypes) => n.id === action.payload.id);
      if (node) {
        node.content = action.payload.content;
      }
    },
    deleteNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter((n: NodeTypes) => n.id !== action.payload);
      state.selectedNodeIds = state.selectedNodeIds.filter(id => id !== action.payload);
      state.connections = state.connections.filter(
        conn => conn.sourceNodeId !== action.payload && conn.targetNodeId !== action.payload
      );
      delete state.properties[action.payload];
    },
    selectNodes: (state, action: PayloadAction<string[]>) => {
      state.selectedNodeIds = action.payload;
    },
    clearSelection: (state) => {
      state.selectedNodeIds = [];
    },
    deleteSelectedNodes: (state) => {
      state.nodes = state.nodes.filter((n: NodeTypes) => !state.selectedNodeIds.includes(n.id));
      state.connections = state.connections.filter(
        conn => !state.selectedNodeIds.includes(conn.sourceNodeId) && !state.selectedNodeIds.includes(conn.targetNodeId)
      );
      state.selectedNodeIds = [];
    },
    addConnection: (state, action: PayloadAction<Connection>) => {
      state.connections.push(action.payload);
    },
    deleteConnection: (state, action: PayloadAction<string>) => {
      state.connections = state.connections.filter(conn => conn.id !== action.payload);
    },
    updateConnection: (state, action: PayloadAction<{ id: string; path: string }>) => {
      const connection = state.connections.find(conn => conn.id === action.payload.id);
      if (connection) {
        connection.path = action.payload.path;
      }
    },
    updatePortValue: (state, action: PayloadAction<{
      nodeId: string;
      portId: string;
      value: string | number
    }>) => {
      const { nodeId, portId, value } = action.payload;
      if (!state.properties[nodeId]) {
        state.properties[nodeId] = {};
      }
      state.properties[nodeId][portId] = value;
    },
  }
});

export const {
  addNode,
  updateNodePosition,
  updateNodeSize,
  updateNodeContent,
  deleteNode,
  selectNodes,
  clearSelection,
  deleteSelectedNodes,
  addConnection,
  deleteConnection,
  updateConnection,
  updatePortValue,
} = flowSlice.actions;

export default flowSlice.reducer; 