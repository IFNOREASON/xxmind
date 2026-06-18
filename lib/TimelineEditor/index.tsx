import { useCallback, useState, useRef, useEffect } from 'react'
import { Graph, Node } from '@antv/x6'
import { TimelineEditorProps, ToolType, TimelineEventData, EVENT_COLORS } from './types'
import GraphCanvas from './GraphCanvas'
import Toolbar from './Toolbar'
import PropertyPanel from './PropertyPanel'
import { TimelineShapeManager } from './TimelineShapeManager'
import './TimelineEditor.css'

export default function TimelineEditor(props: TimelineEditorProps) {
  const [graph, setGraph] = useState<Graph | null>(null)
  const [currentTool, setCurrentTool] = useState<ToolType>('select')
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const shapeManagerRef = useRef<TimelineShapeManager | null>(null)

  const handleGraphReady = useCallback(
    (g: Graph, shapeManager: TimelineShapeManager) => {
      setGraph(g)
      shapeManagerRef.current = shapeManager
      if (props.onGraphReady) {
        props.onGraphReady(g, shapeManager)
      }
    },
    [props],
  )

  const handleSelectionChange = useCallback((nodes: Node[]) => {
    setSelectedNodes(nodes)
  }, [])

  const handleUpdateEvent = useCallback((node: Node, updates: Partial<TimelineEventData>) => {
    if (shapeManagerRef.current) {
      shapeManagerRef.current.updateEventNode(node, updates)
    }
  }, [])

  useEffect(() => {
    if (!graph) return

    const updateHistoryState = () => {
      const history = graph.getPlugin('history') as any
      if (history) {
        setCanUndo(history.canUndo())
        setCanRedo(history.canRedo())
      }
    }

    updateHistoryState()

    graph.on('history:change', updateHistoryState)

    return () => {
      graph.off('history:change', updateHistoryState)
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
    if (graph && shapeManagerRef.current) {
      const cells = graph.getSelectedCells()
      cells.forEach((cell) => {
        if (cell.isNode()) {
          const data = cell.getData() as TimelineEventData
          if (data && data.type === 'event') {
            shapeManagerRef.current!.deleteEventNode(cell as Node)
          }
        }
      })
    }
  }, [graph])

  const handleAddEvent = useCallback(() => {
    if (graph && shapeManagerRef.current) {
      const centerPoint = graph.getCellsBBox(graph.getNodes())
      const x = centerPoint ? centerPoint.center.x : 100
      const { year, month } = shapeManagerRef.current.getPositionDate(x)
      const newNode = shapeManagerRef.current.createEventNode({
        year,
        month,
        title: '新事件',
        description: '',
        color: EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)],
      })
      graph.cleanSelection()
      graph.select(newNode)
    }
  }, [graph])

  const handleResetTimeline = useCallback(() => {
    if (graph && shapeManagerRef.current) {
      const confirmed = window.confirm('确定要清空时间轴重新开始吗？此操作可以撤销。')
      if (confirmed) {
        const eventNodes = graph.getNodes().filter((node) => {
          const data = node.getData() as TimelineEventData
          return data && data.type === 'event'
        })
        eventNodes.forEach((node) => {
          shapeManagerRef.current!.deleteEventNode(node)
        })
      }
    }
  }, [graph])

  const handleZoomIn = useCallback(() => {
    if (graph) {
      const currentZoom = graph.zoom()
      graph.zoomTo(Math.min(currentZoom + 0.1, 3))
    }
  }, [graph])

  const handleZoomOut = useCallback(() => {
    if (graph) {
      const currentZoom = graph.zoom()
      graph.zoomTo(Math.max(currentZoom - 0.1, 0.3))
    }
  }, [graph])

  const handleFitCenter = useCallback(() => {
    if (graph) {
      graph.centerContent()
      graph.zoomToFit({ padding: 50 })
    }
  }, [graph])

  return (
    <div className="timeline-editor">
      <Toolbar
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDelete={handleDeleteSelected}
        onAddEvent={handleAddEvent}
        onResetTimeline={handleResetTimeline}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitCenter={handleFitCenter}
        canUndo={canUndo}
        canRedo={canRedo}
        hasSelection={selectedNodes.length > 0}
      />
      <div className="timeline-editor-content">
        <div className="timeline-editor-canvas">
          <GraphCanvas
            {...props}
            currentTool={currentTool}
            onToolChange={setCurrentTool}
            onGraphReady={handleGraphReady}
            onSelectionChange={handleSelectionChange}
          />
        </div>
        <PropertyPanel
          selectedNodes={selectedNodes}
          onUpdateEvent={handleUpdateEvent}
        />
      </div>
    </div>
  )
}
