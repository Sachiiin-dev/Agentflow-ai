import { create } from 'zustand';
import api from '../services/api';

export const useWorkflowStore = create((set, get) => ({
  workflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isDirty: false,
  isLoading: false,
  isSaving: false,
  isExecuting: false,
  currentExecution: null,
  executionLogs: [],
  activeNodeId: null,
  error: null,

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),
  setSelectedNode: (node) => set({ selectedNode: node }),

  onNodesChange: (changes) => {
    // Basic react-flow node change processor
    set((state) => {
      let updatedNodes = [...state.nodes];
      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          updatedNodes = updatedNodes.map((node) =>
            node.id === change.id ? { ...node, position: change.position } : node
          );
        } else if (change.type === 'select') {
          updatedNodes = updatedNodes.map((node) =>
            node.id === change.id ? { ...node, selected: change.selected } : node
          );
          if (change.selected) {
            const found = updatedNodes.find((n) => n.id === change.id);
            set({ selectedNode: found || null });
          }
        } else if (change.type === 'remove') {
          updatedNodes = updatedNodes.filter((node) => node.id !== change.id);
          if (state.selectedNode?.id === change.id) {
            set({ selectedNode: null });
          }
        }
      }
      return { nodes: updatedNodes, isDirty: true };
    });
  },

  onEdgesChange: (changes) => {
    set((state) => {
      let updatedEdges = [...state.edges];
      for (const change of changes) {
        if (change.type === 'remove') {
          updatedEdges = updatedEdges.filter((edge) => edge.id !== change.id);
        } else if (change.type === 'select') {
          updatedEdges = updatedEdges.map((edge) =>
            edge.id === change.id ? { ...edge, selected: change.selected } : edge
          );
        }
      }
      return { edges: updatedEdges, isDirty: true };
    });
  },

  onConnect: (connection) => {
    set((state) => {
      const edgeId = `e-${connection.source}-${connection.target}-${Date.now()}`;
      const newEdge = {
        ...connection,
        id: edgeId,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      };
      return { edges: [...state.edges, newEdge], isDirty: true };
    });
  },

  addNode: (nodeData) => {
    set((state) => {
      const id = `node_${Date.now()}`;
      const position = {
        x: 200 + Math.random() * 200,
        y: 150 + Math.random() * 150,
      };

      const newNode = {
        id,
        type: nodeData.type || 'ai_action',
        position,
        data: {
          label: nodeData.label || 'New Step',
          category: nodeData.category || 'ai',
          provider: nodeData.provider || 'gemini',
          action: nodeData.action || 'reasoning',
          params: nodeData.params || {},
        },
      };

      return {
        nodes: [...state.nodes, newNode],
        selectedNode: newNode,
        isDirty: true,
      };
    });
  },

  updateNodeData: (nodeId, updatedData) => {
    set((state) => {
      const updatedNodes = state.nodes.map((node) => {
        if (node.id === nodeId) {
          const updated = {
            ...node,
            data: {
              ...node.data,
              ...updatedData,
            },
          };
          if (state.selectedNode?.id === nodeId) {
            set({ selectedNode: updated });
          }
          return updated;
        }
        return node;
      });

      return { nodes: updatedNodes, isDirty: true };
    });
  },

  removeNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
      isDirty: true,
    }));
  },

  fetchWorkflow: async (workflowId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/workflows/${workflowId}`);
      const wf = res.data;
      set({
        workflow: wf,
        nodes: wf.nodes || [],
        edges: wf.edges || [],
        selectedNode: null,
        isDirty: false,
        isLoading: false,
      });
      return wf;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  saveWorkflow: async () => {
    const { workflow, nodes, edges } = get();
    if (!workflow) return;

    set({ isSaving: true });
    try {
      const payload = {
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        triggerConfig: workflow.triggerConfig,
        nodes,
        edges,
        tags: workflow.tags,
      };

      const res = await api.put(`/workflows/${workflow._id || workflow.id}`, payload);
      set({
        workflow: res.data,
        isDirty: false,
        isSaving: false,
      });
      return res.data;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  triggerWorkflowExecution: async (workflowId) => {
    set({ isExecuting: true, executionLogs: [], activeNodeId: null });
    try {
      const res = await api.post(`/workflows/${workflowId}/execute`, {});
      const execution = res.data;
      set({ currentExecution: execution, isExecuting: true });
      return execution;
    } catch (err) {
      set({ isExecuting: false, error: err.message });
      throw err;
    }
  },

  addExecutionLog: (logEvent) => {
    set((state) => ({
      executionLogs: [...state.executionLogs, logEvent],
    }));
  },

  setActiveNodeId: (nodeId) => set({ activeNodeId: nodeId }),

  setCurrentExecutionStatus: (status) => {
    set((state) => ({
      isExecuting: status === 'RUNNING' || status === 'PENDING' || status === 'RETRYING',
      currentExecution: state.currentExecution ? { ...state.currentExecution, status } : null,
      activeNodeId: status === 'COMPLETED' || status === 'FAILED' ? null : state.activeNodeId,
    }));
  },
}));
