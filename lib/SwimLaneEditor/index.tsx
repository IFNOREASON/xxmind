import { useCallback, useState } from 'react'
import { Graph, Node, Edge } from '@antv/x6'
import { SwimLaneContext } from './context'
import { SwimLaneEditorProps, ToolType } from './types'
import GraphCanvas from './GraphCanvas'
import Toolbar from './Toolbar'
import PropertyPanel from './PropertyPanel'
import './SwimLaneEditor.css'

export default function SwimLaneEditor(props: SwimLaneEditorProps) {
  const [graph, setGraph] = useState<Graph | null>(null)
  const [currentTool, setCurrentTool] = useState<ToolType>('select')
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([])
  const [selectedLanes, setSelectedLanes] = useState<string[]>([])
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

  const handleSelectionChange = useCallback((nodes: Node[], edges: Edge[], lanes: string[]) => {
    setSelectedNodes(nodes)
    setSelectedEdges(edges)
    setSelectedLanes(lanes)
    setPasteOffset({ x: 20, y: 20 })
  }, [])

  const handleToolChange = useCallback((tool: ToolType) => {
    setCurrentTool(tool)
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
      setSelectedLanes([])
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

  const handleAddLane = useCallback((isHorizontal: boolean) => {
    setCurrentTool(isHorizontal ? 'lane-horizontal' : 'lane-vertical')
  }, [])

  const handleClearLane = useCallback((laneId: string) => {
    if (!graph) return
    const laneNode = graph.getCellById(laneId)
    if (!laneNode) return

    const laneBBox = laneNode.getBBox()
    const allNodes = graph.getNodes()

    const nodesInLane = allNodes.filter((node) => {
      if (node.id === laneId) return false
      const nodeBBox = node.getBBox()
      return laneBBox.containsRect(nodeBBox)
    })

    graph.removeCells(nodesInLane)
    forceUpdate({})
  }, [graph])

  const handleDeleteLane = useCallback((laneId: string) => {
    if (!graph) return
    const laneNode = graph.getCellById(laneId)
    if (!laneNode) return

    const laneBBox = laneNode.getBBox()
    const allNodes = graph.getNodes()
    const allEdges = graph.getEdges()

    const nodesInLane = allNodes.filter((node) => {
      if (node.id === laneId) return false
      const nodeBBox = node.getBBox()
      return laneBBox.containsRect(nodeBBox)
    })

    const edgesToRemove = allEdges.filter((edge) => {
      const sourceId = typeof edge.source === 'object' ? (edge.source as any).cell : null
      const targetId = typeof edge.target === 'object' ? (edge.target as any).cell : null
      const sourceInLane = nodesInLane.some((n) => n.id === sourceId)
      const targetInLane = nodesInLane.some((n) => n.id === targetId)
      return sourceInLane || targetInLane
    })

    graph.removeCells([...nodesInLane, ...edgesToRemove, laneNode])
    setSelectedLanes([])
    setSelectedNodes([])
    forceUpdate({})
  }, [graph])

  const handleUpdateLaneName = useCallback((laneId: string, name: string) => {
    if (!graph) return
    const laneNode = graph.getCellById(laneId)
    if (laneNode) {
      laneNode.attr('label/text', name)
    }
  }, [graph])

  const contextValue = {
    graph,
    currentTool,
    setCurrentTool: handleToolChange,
    selectedNodes,
    selectedEdges,
    selectedLanes,
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    zoomReset: handleZoomReset,
    fitCenter: handleZoomReset,
    undo: handleUndo,
    redo: handleRedo,
    deleteSelected: handleDeleteSelected,
    copy: handleCopy,
    paste: handlePaste,
    addLane: handleAddLane,
    clearLane: handleClearLane,
    deleteLane: handleDeleteLane,
    updateLaneName: handleUpdateLaneName,
  }

  return (
    <SwimLaneContext.Provider value={contextValue}>
      <div className="swimlane-editor">
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
          onAddHorizontalLane={() => handleAddLane(true)}
          onAddVerticalLane={() => handleAddLane(false)}
        />
        <div className="swimlane-editor-content">
          <div className="swimlane-editor-canvas">
            <GraphCanvas
              {...props}
              currentTool={currentTool}
              onToolChange={handleToolChange}
              onGraphReady={handleGraphReady}
              onSelectionChange={handleSelectionChange}
            />
          </div>
          <PropertyPanel
            graph={graph}
            selectedNodes={selectedNodes}
            selectedEdges={selectedEdges}
            selectedLanes={selectedLanes}
            onDeleteLane={handleDeleteLane}
            onClearLane={handleClearLane}
          />
        </div>
      </div>
    </SwimLaneContext.Provider>
  )
}
