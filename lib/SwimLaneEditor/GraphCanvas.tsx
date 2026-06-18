import { useEffect, useRef, useCallback, useState } from 'react'
import { Graph, Node, Edge, Selection, Transform, Snapline, Keyboard, Clipboard, History } from '@antv/x6'
import { SwimLaneEditorProps, ToolType } from './types'
import './GraphCanvas.css'

interface GraphCanvasProps extends SwimLaneEditorProps {
  currentTool: ToolType
  onToolChange: (tool: ToolType) => void
  onGraphReady: (graph: Graph) => void
  onSelectionChange: (nodes: Node[], edges: Edge[], lanes: string[]) => void
}

const LANE_COLORS = [
  '#e6f7ff',
  '#f0f5ff',
  '#f6ffed',
  '#fff7e6',
  '#fff1f0',
  '#f9f0ff',
]

const createNodeWithPorts = (graph: Graph, config: any) => {
  const node = graph.createNode({
    ...config,
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
      },
      items: [
        { group: 'top', id: 'port-top' },
        { group: 'right', id: 'port-right' },
        { group: 'bottom', id: 'port-bottom' },
        { group: 'left', id: 'port-left' },
      ],
    },
  })
  graph.addNode(node)
  return node
}

const createSwimLane = (graph: Graph, config: {
  id?: string
  x: number
  y: number
  width: number
  height: number
  name: string
  color: string
  isHorizontal: boolean
}) => {
  const lane = graph.createNode({
    id: config.id,
    shape: 'rect',
    x: config.x,
    y: config.y,
    width: config.width,
    height: config.height,
    data: {
      type: 'swimlane',
      isHorizontal: config.isHorizontal,
    },
    attrs: {
      body: {
        fill: config.color,
        stroke: '#d9d9d9',
        strokeWidth: 1,
        rx: 4,
        ry: 4,
      },
      label: {
        text: config.name,
        fill: '#333',
        fontSize: 14,
        fontWeight: 'bold',
        textWrap: {
          width: -10,
          height: -10,
        },
      },
    },
    zIndex: -1,
  })
  graph.addNode(lane)
  return lane
}

export default function GraphCanvas({
  initialLanes,
  initialNodes,
  initialEdges,
  onGraphReady,
  onSelectionChange,
  currentTool,
  onToolChange,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)
  const [isReady, setIsReady] = useState(false)
  const pasteOffsetRef = useRef({ x: 20, y: 20 })
  const laneCounterRef = useRef(0)

  const getLaneColor = (index: number) => LANE_COLORS[index % LANE_COLORS.length]

  const createFlowNode = useCallback(
    (type: 'start' | 'process' | 'decision' | 'end', x: number, y: number) => {
      if (!graphRef.current) return null

      const configs = {
        start: {
          width: 100,
          height: 50,
          label: '开始',
          attrs: {
            body: {
              fill: '#91d5ff',
              stroke: '#1890ff',
              strokeWidth: 2,
              rx: 25,
              ry: 25,
            },
            label: {
              fill: '#0050b3',
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
        },
        process: {
          width: 140,
          height: 70,
          label: '处理步骤',
          attrs: {
            body: {
              fill: '#ffffff',
              stroke: '#1890ff',
              strokeWidth: 2,
            },
            label: {
              fill: '#333333',
              fontSize: 14,
            },
          },
        },
        decision: {
          width: 120,
          height: 100,
          label: '判断条件',
          attrs: {
            body: {
              fill: '#fffbe6',
              stroke: '#faad14',
              strokeWidth: 2,
              refPoints: '60,0 120,50 60,100 0,50',
            },
            label: {
              fill: '#fa8c16',
              fontSize: 14,
            },
          },
        },
        end: {
          width: 100,
          height: 50,
          label: '结束',
          attrs: {
            body: {
              fill: '#d9f7be',
              stroke: '#52c41a',
              strokeWidth: 2,
              rx: 25,
              ry: 25,
            },
            label: {
              fill: '#389e0d',
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
        },
      }

      const config = configs[type]
      return createNodeWithPorts(graphRef.current, {
        shape: type === 'decision' ? 'polygon' : 'rect',
        x: x - config.width / 2,
        y: y - config.height / 2,
        width: config.width,
        height: config.height,
        label: config.label,
        data: { type, description: '' },
        attrs: config.attrs,
      })
    },
    [],
  )

  const handleAddLane = useCallback(
    (isHorizontal: boolean, x: number, y: number) => {
      if (!graphRef.current) return null

      laneCounterRef.current += 1
      const laneName = `泳道 ${laneCounterRef.current}`

      return createSwimLane(graphRef.current, {
        x: x - 300,
        y: y - 150,
        width: isHorizontal ? 800 : 250,
        height: isHorizontal ? 200 : 600,
        name: laneName,
        color: getLaneColor(laneCounterRef.current - 1),
        isHorizontal,
      })
    },
    [],
  )

  useEffect(() => {
    if (!containerRef.current) return

    const graph = new Graph({
      container: containerRef.current,
      grid: {
        size: 10,
        visible: true,
        type: 'dot',
        args: {
          color: '#d9d9d9',
          thickness: 1,
        },
      },
      panning: {
        enabled: true,
        modifiers: '',
        eventTypes: ['leftMouseDown', 'rightMouseDown'],
      },
      mousewheel: {
        enabled: true,
        modifiers: '',
        factor: 1.1,
        zoomAtMousePosition: true,
        minScale: 0.1,
        maxScale: 3,
      },
      connecting: {
        router: {
          name: 'manhattan',
        },
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        allowMulti: true,
        allowLoop: false,
        allowEdge: false,
        allowNode: false,
        snap: {
          radius: 20,
        },
        createEdge() {
          return new Edge({
            attrs: {
              line: {
                stroke: '#666',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 12,
                  height: 8,
                },
              },
            },
            zIndex: 10,
          })
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#1890ff',
              stroke: '#1890ff',
            },
          },
        },
      },
      interacting: (cellView) => {
        if (cellView.cell.isEdge()) {
          return {
            vertexMovable: true,
            edgeMovable: true,
            arrowheadMovable: false,
            labelMovable: true,
          }
        }
        return true
      },
    })

    graph.use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
        showEdgeSelectionBox: true,
        pointerEvents: 'none',
      } as any),
    )

    graph.use(
      new Transform({
        resizing: {
          enabled: true,
          minWidth: 50,
          minHeight: 30,
        },
        rotating: {
          enabled: false,
        },
      }),
    )

    graph.use(
      new Snapline({
        enabled: true,
        sharp: true,
        tolerance: 10,
      }),
    )

    graph.use(
      new Keyboard({
        enabled: true,
        global: true,
      }),
    )

    graph.use(
      new Clipboard({
        enabled: true,
        useLocalStorage: true,
      }),
    )

    graph.use(
      new History({
        enabled: true,
      }),
    )

    graph.bindKey('delete', () => {
      const cells = graph.getSelectedCells()
      if (cells.length > 0) {
        graph.removeCells(cells)
      }
    })

    graph.bindKey('backspace', () => {
      const cells = graph.getSelectedCells()
      if (cells.length > 0) {
        graph.removeCells(cells)
      }
    })

    graph.bindKey('ctrl+c', () => {
      const cells = graph.getSelectedCells()
      if (cells.length > 0) {
        const clipboard = graph.getPlugin<Clipboard>('clipboard')
        if (clipboard) {
          clipboard.copy(cells)
        }
      }
    })

    graph.bindKey('ctrl+v', () => {
      const clipboard = graph.getPlugin('clipboard') as any
      if (clipboard && !clipboard.isEmpty()) {
        const offset = pasteOffsetRef.current
        const cells = clipboard.paste({
          offset: { dx: offset.x, dy: offset.y },
        })
        graph.select(cells)
        pasteOffsetRef.current = { x: offset.x + 20, y: offset.y + 20 }
      }
    })

    graph.bindKey('ctrl+x', () => {
      const cells = graph.getSelectedCells()
      if (cells.length > 0) {
        const clipboard = graph.getPlugin('clipboard') as any
        if (clipboard) {
          clipboard.cut(cells)
        }
      }
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
      const nodes = graph.getNodes()
      const edges = graph.getEdges()
      graph.select([...nodes, ...edges])
    })

    graph.on('selection:changed', ({ selected, removed }) => {
      const nodes = selected.filter((item): item is Node => item instanceof Node)
      const edges = selected.filter((item): item is Edge => item instanceof Edge)
      const lanes = nodes
        .filter((node) => node.getData()?.type === 'swimlane')
        .map((node) => node.id)

      if (onSelectionChange) {
        onSelectionChange(nodes, edges, lanes)
      }
    })

    graph.on('node:dblclick', ({ node, e }) => {
      e.stopPropagation()

      const cellView = graph.findView(node)
      if (!cellView) return

      const isSwimLane = node.getData()?.type === 'swimlane'
      const text = node.getAttrByPath('label/text') || ''
      const bbox = node.getBBox()

      const zoom = graph.zoom()
      const translate = graph.translate()

      const input = document.createElement('input')
      input.value = text as string
      input.style.position = 'absolute'
      input.style.left = `${bbox.x * zoom + translate.tx + 10}px`
      input.style.top = `${bbox.y * zoom + translate.ty + 10}px`
      input.style.width = `${(bbox.width - 20) * zoom}px`
      input.style.height = `${Math.min(30, (bbox.height - 20) * zoom)}px`
      input.style.fontSize = `${14 * zoom}px`
      input.style.textAlign = 'center'
      input.style.border = '2px solid #1890ff'
      input.style.outline = 'none'
      input.style.padding = '0 4px'
      input.style.boxSizing = 'border-box'
      input.style.backgroundColor = 'white'
      input.style.zIndex = '9999'

      const container = containerRef.current
      if (!container) return

      container.appendChild(input)
      input.focus()
      input.select()

      const finish = () => {
        const newText = input.value
        node.attr('label/text', newText)
        container.removeChild(input)
        graph.cleanSelection()
        graph.select(node)
      }

      input.addEventListener('blur', finish)
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          input.blur()
        }
        if (e.key === 'Escape') {
          input.value = text as string
          input.blur()
        }
      })
    })

    graph.on('blank:contextmenu', ({ e }) => {
      e.preventDefault()
    })

    graph.on('node:contextmenu', ({ e }) => {
      e.preventDefault()
    })

    graph.on('selection:changed', () => {
      pasteOffsetRef.current = { x: 20, y: 20 }
    })

    createSwimLane(graph, {
      x: 100,
      y: 50,
      width: 800,
      height: 200,
      name: '产品部',
      color: getLaneColor(0),
      isHorizontal: true,
    })

    createSwimLane(graph, {
      x: 100,
      y: 270,
      width: 800,
      height: 200,
      name: '技术部',
      color: getLaneColor(1),
      isHorizontal: true,
    })

    createSwimLane(graph, {
      x: 100,
      y: 490,
      width: 800,
      height: 200,
      name: '运营部',
      color: getLaneColor(2),
      isHorizontal: true,
    })

    laneCounterRef.current = 3

    const startNode = createFlowNode('start', 250, 150)
    const processNode1 = createFlowNode('process', 450, 150)
    const decisionNode = createFlowNode('decision', 650, 370)
    const processNode2 = createFlowNode('process', 450, 590)
    const endNode = createFlowNode('end', 650, 590)

    if (startNode && processNode1) {
      graph.addEdge({
        source: { cell: startNode.id, port: 'port-right' },
        target: { cell: processNode1.id, port: 'port-left' },
        attrs: {
          line: {
            stroke: '#666',
            strokeWidth: 2,
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
            },
          },
        },
      })
    }

    if (processNode1 && decisionNode) {
      graph.addEdge({
        source: { cell: processNode1.id, port: 'port-bottom' },
        target: { cell: decisionNode.id, port: 'port-top' },
        labels: [{ attrs: { text: { text: '评审' } } }],
        attrs: {
          line: {
            stroke: '#666',
            strokeWidth: 2,
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
            },
          },
        },
      })
    }

    if (decisionNode && processNode2) {
      graph.addEdge({
        source: { cell: decisionNode.id, port: 'port-bottom' },
        target: { cell: processNode2.id, port: 'port-top' },
        labels: [{ attrs: { text: { text: '通过' } } }],
        attrs: {
          line: {
            stroke: '#52c41a',
            strokeWidth: 2,
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
            },
          },
        },
      })
    }

    if (processNode2 && endNode) {
      graph.addEdge({
        source: { cell: processNode2.id, port: 'port-right' },
        target: { cell: endNode.id, port: 'port-left' },
        attrs: {
          line: {
            stroke: '#666',
            strokeWidth: 2,
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
            },
          },
        },
      })
    }

    graphRef.current = graph
    setIsReady(true)

    if (onGraphReady) {
      onGraphReady(graph)
    }

    return () => {
      graph.dispose()
      graphRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!graphRef.current || !isReady) return

    const graph = graphRef.current
    const container = containerRef.current

    if (currentTool === 'hand') {
      if (container) {
        container.style.cursor = 'grab'
      }
    } else if (currentTool === 'select') {
      if (container) {
        container.style.cursor = 'default'
      }
    }
  }, [currentTool, isReady])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!graphRef.current) return

      const graph = graphRef.current
      const point = graph.clientToLocal(e.clientX, e.clientY)

      const flowNodeTypes = ['start', 'process', 'decision', 'end'] as const

      if (flowNodeTypes.includes(currentTool as any)) {
        createFlowNode(currentTool as any, point.x, point.y)
        onToolChange('select')
      } else if (currentTool === 'lane-horizontal') {
        handleAddLane(true, point.x, point.y)
        onToolChange('select')
      } else if (currentTool === 'lane-vertical') {
        handleAddLane(false, point.x, point.y)
        onToolChange('select')
      }
    },
    [currentTool, createFlowNode, handleAddLane, onToolChange],
  )

  return (
    <div
      className="graph-canvas"
      ref={containerRef}
      onClick={handleCanvasClick}
    />
  )
}
