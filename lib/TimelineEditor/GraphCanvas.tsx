import { useEffect, useRef, useCallback, useState } from 'react'
import { Graph, Node, Selection, Keyboard, History } from '@antv/x6'
import { TimelineEditorProps, ToolType, TimelineEventData, EVENT_COLORS } from './types'
import { TimelineShapeManager } from './TimelineShapeManager'
import './GraphCanvas.css'

interface GraphCanvasProps extends TimelineEditorProps {
  currentTool: ToolType
  onToolChange: (tool: ToolType) => void
  onGraphReady: (graph: Graph, shapeManager: TimelineShapeManager) => void
  onSelectionChange: (nodes: Node[]) => void
}

export default function GraphCanvas({
  initialData,
  onGraphReady,
  onSelectionChange,
  currentTool,
  onToolChange,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)
  const shapeManagerRef = useRef<TimelineShapeManager | null>(null)
  const [isReady, setIsReady] = useState(false)
  const isDraggingRef = useRef(false)
  const dragStartPosRef = useRef({ x: 0, y: 0 })
  const dragNodeRef = useRef<Node | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const graph = new Graph({
      container: containerRef.current,
      grid: false,
      background: {
        color: '#fafafa',
      },
      panning: {
        enabled: true,
        modifiers: '',
        eventTypes: ['leftMouseDown'],
      },
      mousewheel: {
        enabled: true,
        modifiers: '',
        factor: 1.1,
        zoomAtMousePosition: true,
        minScale: 0.3,
        maxScale: 3,
      },
      interacting: (cellView) => {
        const cell = cellView.cell
        const data = cell.getData() as TimelineEventData
        if (data && data.type === 'event') {
          return {
            nodeMovable: true,
            nodeResizable: false,
            nodeRotatable: false,
          }
        }
        return {
          nodeMovable: false,
          nodeResizable: false,
          nodeRotatable: false,
        }
      },
    })

    graph.use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
        pointerEvents: 'none',
      }),
    )

    graph.use(
      new Keyboard({
        enabled: true,
        global: true,
      }),
    )

    graph.use(
      new History({
        enabled: true,
      }),
    )

    const shapeManager = new TimelineShapeManager(graph)
    shapeManagerRef.current = shapeManager
    shapeManager.initializeTimeline()

    graph.bindKey('delete', () => {
      const cells = graph.getSelectedCells()
      cells.forEach((cell) => {
        if (cell.isNode()) {
          const data = cell.getData() as TimelineEventData
          if (data && data.type === 'event') {
            shapeManager.deleteEventNode(cell as Node)
          }
        }
      })
    })

    graph.bindKey('backspace', () => {
      const cells = graph.getSelectedCells()
      cells.forEach((cell) => {
        if (cell.isNode()) {
          const data = cell.getData() as TimelineEventData
          if (data && data.type === 'event') {
            shapeManager.deleteEventNode(cell as Node)
          }
        }
      })
    })

    graph.bindKey('ctrl+z', () => {
      const history = graph.getPlugin('history') as any
      if (history && history.canUndo()) {
        history.undo()
      }
    })

    graph.bindKey('ctrl+y', () => {
      const history = graph.getPlugin('history') as any
      if (history && history.canRedo()) {
        history.redo()
      }
    })

    graph.bindKey('ctrl+a', () => {
      const eventNodes = graph.getNodes().filter((node) => {
        const data = node.getData() as TimelineEventData
        return data && data.type === 'event'
      })
      graph.select(eventNodes)
    })

    graph.on('selection:changed', ({ selected }) => {
      const nodes = selected.filter((item): item is Node => item instanceof Node)
      if (onSelectionChange) {
        onSelectionChange(nodes)
      }
    })

    graph.on('node:mousedown', ({ node, e }) => {
      const data = node.getData() as TimelineEventData
      if (data && data.type === 'event') {
        isDraggingRef.current = true
        dragNodeRef.current = node
        dragStartPosRef.current = { x: e.clientX, y: e.clientY }
      }
    })

    graph.on('node:mousemove', ({ node, e }) => {
      if (!isDraggingRef.current || dragNodeRef.current !== node) return
      
      const data = node.getData() as TimelineEventData
      if (data && data.type === 'event' && shapeManagerRef.current) {
        const bbox = node.getBBox()
        const centerX = bbox.center.x
        const { year, month } = shapeManagerRef.current.getPositionDate(centerX)
        
        if (year !== data.year || month !== data.month) {
          shapeManagerRef.current.updateEventNode(node, { year, month })
        }
      }
    })

    graph.on('node:mouseup', () => {
      isDraggingRef.current = false
      dragNodeRef.current = null
    })

    graph.on('blank:mouseup', () => {
      isDraggingRef.current = false
      dragNodeRef.current = null
    })

    graph.on('blank:contextmenu', ({ e }) => {
      e.preventDefault()
    })

    graph.on('node:contextmenu', ({ e }) => {
      e.preventDefault()
    })

    graph.on('blank:click', ({ e }) => {
      if (currentTool === 'addEvent' && shapeManagerRef.current) {
        const localCoords = graph.clientToLocal(e.clientX, e.clientY)
        const { year, month } = shapeManagerRef.current.getPositionDate(localCoords.x)
        
        const newNode = shapeManagerRef.current.createEventNode({
          year,
          month,
          title: '新事件',
          description: '',
          color: EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)],
        })
        
        graph.cleanSelection()
        graph.select(newNode)
        onToolChange('select')
      }
    })

    graph.centerContent()
    graph.zoomTo(0.8)

    graphRef.current = graph
    setIsReady(true)

    if (onGraphReady) {
      onGraphReady(graph, shapeManager)
    }

    return () => {
      graph.dispose()
      graphRef.current = null
      shapeManagerRef.current = null
    }
  }, [onGraphReady, onSelectionChange, currentTool, onToolChange])

  useEffect(() => {
    if (!graphRef.current || !isReady) return

    const graph = graphRef.current
    const container = containerRef.current

    if (currentTool === 'hand') {
      if (container) {
        container.style.cursor = 'grab'
      }
    } else if (currentTool === 'addEvent') {
      if (container) {
        container.style.cursor = 'crosshair'
      }
    } else if (currentTool === 'select') {
      if (container) {
        container.style.cursor = 'default'
      }
    }
  }, [currentTool, isReady])

  return (
    <div
      className="graph-canvas timeline"
      ref={containerRef}
    />
  )
}
