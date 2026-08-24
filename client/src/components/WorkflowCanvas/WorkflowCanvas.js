import React, { useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import { useWorkflowStore } from '../../store/workflowStore';

export default function WorkflowCanvas() {
  const reactFlowWrapper = useRef(null);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const addNode = useWorkflowStore((s) => s.addNode);

  // Register custom node types
  const nodeTypes = useMemo(
    () => ({
      trigger: CustomNode,
      ai_action: CustomNode,
      integration_action: CustomNode,
      condition: CustomNode,
      transformer: CustomNode,
      default: CustomNode,
    }),
    []
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      try {
        const nodeItem = JSON.parse(rawData);
        addNode(nodeItem);
      } catch (err) {
        console.error('Failed to parse dropped node data:', err);
      }
    },
    [addNode]
  );

  return (
    <div className="w-full h-full flex-1 relative bg-[#070b14]" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2.5 },
        }}
      >
        <Controls position="bottom-right" className="!m-4 shadow-xl" />
        <MiniMap
          position="bottom-left"
          nodeColor="#3b82f6"
          maskColor="rgba(15, 23, 42, 0.8)"
          className="!m-4 !border !border-slate-800 !rounded-xl !overflow-hidden !bg-slate-950/80"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="rgba(148, 163, 184, 0.12)"
        />
      </ReactFlow>
    </div>
  );
}
