/**
 * AetherOS — System Modeling Canvas
 * The foundational node-based visual interaction layer.
 */
import React, { useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import useStore from '../store/useStore';
import ArchitectureNode from './nodes/ArchitectureNode';
import { openCBCTContext, canInspectInCBCT } from '../integrations/cbctAdapter';
import { queuePrefetch } from '../services/cbctPrefetch';

const nodeTypes = {
  service: ArchitectureNode,
  api: ArchitectureNode,
  database: ArchitectureNode,
  cache: ArchitectureNode,
  queue: ArchitectureNode,
  worker: ArchitectureNode,
  runtime: ArchitectureNode,
  container: ArchitectureNode,
  boundary: ArchitectureNode,
  frontend: ArchitectureNode
};

function CanvasInner() {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const onNodesChange = useStore(s => s.onNodesChange);
  const onEdgesChange = useStore(s => s.onEdgesChange);
  const onConnect = useStore(s => s.onConnect);
  const setSelectedNode = useStore(s => s.setSelectedNode);
  const setSelectedEdge = useStore(s => s.setSelectedEdge);
  const removeNode = useStore(s => s.removeNode);
  const removeEdge = useStore(s => s.removeEdge);
  const addNode = useStore(s => s.addNode);

  const selectedEdgeRef = useRef(null);

  const onNodeClick = useCallback((_event, node) => {
    selectedEdgeRef.current = null;
    setSelectedEdge(null);
    setSelectedNode(node.id);
  }, [setSelectedNode, setSelectedEdge]);

  const onNodeDoubleClick = useCallback((_event, node) => {
    // ADAPTER PATTERN: Use CBCT Adapter to build URL
    // The adapter abstracts all CBCT integration details
    try {
      const lastInferredRepo = useStore.getState().lastInferredRepo;
      
      // Check if node can be inspected via adapter
      if (!canInspectInCBCT(node, lastInferredRepo)) {
        console.warn('[ModelingCanvas] Cannot inspect node in CBCT: no repository path');
        return;
      }

      // Build CBCT URL using adapter
      const cbctUrl = openCBCTContext(node, lastInferredRepo);
      
      // Transition to CODE view with adapter-generated URL
      const store = useStore.getState();
      store.enterCodeView(node.id);
      store.setCbctUrl(cbctUrl);
      
      // Optionally prefetch next nodes for performance
      if (lastInferredRepo) {
        queuePrefetch(lastInferredRepo);
      }
    } catch (err) {
      console.error('[ModelingCanvas] Error entering CODE view:', err.message);
      useStore.getState().setNotification(
        'Cannot open code view: ' + err.message
      );
    }
  }, []);

  const onEdgeClick = useCallback((_event, edge) => {
    setSelectedNode(null);
    setSelectedEdge(edge.id);
    selectedEdgeRef.current = edge.id;
  }, [setSelectedNode, setSelectedEdge]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    selectedEdgeRef.current = null;
  }, [setSelectedNode, setSelectedEdge]);

  // Keyboard shortcuts: Delete/Backspace to remove selected node or edge
  const onKeyDown = useCallback((event) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // Don't delete if user is typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') return;
      if (selectedEdgeRef.current) {
        removeEdge(selectedEdgeRef.current);
        selectedEdgeRef.current = null;
      } else if (selectedNodeId) {
        removeNode(selectedNodeId);
      }
    }
  }, [selectedNodeId, removeNode, removeEdge]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/aetheros-node-type');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode({ type, position, label: `New ${type}` });
    },
    [screenToFlowPosition, addNode]
  );

  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    animated: false
  }), []);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full" onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        deleteKeyCode={null}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e1e2e" gap={20} size={1} />
        <Controls position="bottom-right" />
        <MiniMap
          position="bottom-left"
          nodeColor={(n) => {
            const status = n.data?.status;
            if (status === 'failed') return '#ef4444';
            if (status === 'degraded') return '#f59e0b';
            return '#6366f1';
          }}
          maskColor="rgba(0,0,0,0.7)"
        />
      </ReactFlow>
    </div>
  );
}

export default function ModelingCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
