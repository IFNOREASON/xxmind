import { useCallback, useState } from 'react'
import { Graph, Node, Edge } from '@antv/x6'
import { FlowChartContext } from './context'
import { FlowChartEditorProps, ToolType } from './types'
import GraphCanvas from './GraphCanvas'
import Toolbar from './Toolbar'
import PropertyPanel from './PropertyPanel'
import './FlowChartEditor.css'

export default function FlowChartEditor(props: FlowChartEditorProps) {
  const [graph, setGraph] = useState<Graph | null>(null)
  const [currentTool, setCurrentTool] = useState<ToolType>('select')
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([])
  const [pasteOffset, setPasteOffset] = useState({ x: 20, y: 20 })
  const [, forceUpdate] = useState({})

  const handleGraphReady = useCallback(
    (g: Graph) => {
      setGraph(g)
      if (props.onGraphReady) {
        props.onGraphReady(g)
      }
    },
    [props],
  )

  const handleSelectionChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setSelectedNodes(nodes)
    setSelectedEdges(edges)
    setPasteOffset({ x: 20, y: 20 })
  }, [])

  const handleToolChange = useCallback((tool: ToolType) => {
    setCurrentTool(tool)
  }, [])

  const handleUpdateNode = useCallback((node: Node, updates: Record<string, any>) => {
    node.prop(updates)
    forceUpdate({})
  }, [])

  const handleZoomIn = useCallback(() => {
    if (graph) {
      graph.zoom(0.1, { minScale: 0.5, maxScale: 2 })
    }
  }, [graph])

  const handleZoomOut = useCallback(() => {
    if (graph) {
      graph.zoom(-0.1, { minScale: 0.5, maxScale: 2 })
    }
  }, [graph])

  const handleZoomReset = useCallback(() => {
    if (graph) {
      graph.zoomTo(1)
      graph.centerContent()
    }
  }, [graph])

  const handleUndo = useCallback(() => {
    if (graph) {
      const history = graph.getPlugin('history') as any
      if (history && history.canUndo()) {
        history.undo()
      }
    }
  }, [graph])

  const handleRedo = useCallback(() => {
    if (graph) {
      const history = graph.getPlugin('history') as any
      if (history && history.canRedo()) {
        history.redo()
      }
    }
  }, [graph])

  const handleDeleteSelected = useCallback(() => {
    if (graph) {
      graph.removeCells([...selectedNodes, ...selectedEdges])
      setSelectedNodes([])
      setSelectedEdges([])
    }
  }, [graph, selectedNodes, selectedEdges])

  const handleCopy = useCallback(() => {
    if (graph && (selectedNodes.length > 0 || selectedEdges.length > 0)) {
      const clipboard = graph.getPlugin('clipboard') as any
      if (clipboard) {
        clipboard.copy([...selectedNodes, ...selectedEdges])
      }
    }
  }, [graph, selectedNodes, selectedEdges])

  const handlePaste = useCallback(() => {
    if (graph) {
      const clipboard = graph.getPlugin('clipboard') as any
      if (clipboard && !clipboard.isEmpty()) {
        const cells = clipboard.paste({
          offset: { x: pasteOffset.x, y: pasteOffset.y },
        })
        graph.select(cells)
        setPasteOffset({ x: pasteOffset.x + 20, y: pasteOffset.y + 20 })
      }
    }
  }, [graph, pasteOffset])

  const contextValue = {
    graph,
    currentTool,
    setCurrentTool: handleToolChange,
    selectedNodes,
    selectedEdges,
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    zoomReset: handleZoomReset,
    fitCenter: handleZoomReset,
    undo: handleUndo,
    redo: handleRedo,
    deleteSelected: handleDeleteSelected,
    copy: handleCopy,
    paste: handlePaste,
  }

  return (
    <FlowChartContext.Provider value={contextValue}>
      <div className="flowchart-editor">
        <Toolbar
          currentTool={currentTool}
          onToolChange={handleToolChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onDelete={handleDeleteSelected}
          onCopy={handleCopy}
          onPaste={handlePaste}
        />
        <div className="flowchart-editor-content">
          <div className="flowchart-editor-canvas">
            <GraphCanvas
              {...props}
              currentTool={currentTool}
              onToolChange={handleToolChange}
              onGraphReady={handleGraphReady}
              onSelectionChange={handleSelectionChange}
            />
          </div>
          <PropertyPanel
            selectedNodes={selectedNodes}
            selectedEdges={selectedEdges}
            onUpdateNode={handleUpdateNode}
          />
        </div>
      </div>
    </FlowChartContext.Provider>
  )
}
