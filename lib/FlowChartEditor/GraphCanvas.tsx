import { useEffect, useRef, useCallback, useState } from 'react'
import { Graph, Node, Edge, Selection, Transform, Snapline, Keyboard, Clipboard, History } from '@antv/x6'
import { FlowChartEditorProps, ToolType } from './types'
import './GraphCanvas.css'

interface GraphCanvasProps extends FlowChartEditorProps {
  currentTool: ToolType
  onToolChange: (tool: ToolType) => void
  onGraphReady: (graph: Graph) => void
  onSelectionChange: (nodes: Node[], edges: Edge[]) => void
}

const createNodeWithPorts = (graph: Graph, config: any) => {
  const node = graph.createNode({
    ...config,
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 3,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 3,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 3,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 3,
              magnet: true,
              stroke: '#5F95FF',
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

export default function GraphCanvas({
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

  const createNode = useCallback(
    (type: ToolType, x: number, y: number) => {
      if (!graphRef.current) return null

      const baseProps = {
        x: x - 60,
        y: y - 30,
        width: 120,
        height: 60,
        label: '节点',
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
      }

      const nodeConfig = {
        rect: { shape: 'rect', ...baseProps },
        'rounded-rect': {
          shape: 'rect',
          ...baseProps,
          attrs: {
            ...baseProps.attrs,
            body: { ...baseProps.attrs.body, rx: 8, ry: 8 },
          },
        },
        circle: {
          shape: 'circle',
          ...baseProps,
          width: 60,
          height: 60,
          x: x - 30,
          y: y - 30,
        },
        ellipse: { shape: 'ellipse', ...baseProps },
        diamond: {
          shape: 'polygon',
          ...baseProps,
          x: x - 50,
          y: y - 50,
          width: 100,
          height: 100,
          attrs: {
            ...baseProps.attrs,
            body: {
              ...baseProps.attrs.body,
              refPoints: '50,10 90,50 50,90 10,50',
            },
          },
        },
        polygon: {
          shape: 'polygon',
          ...baseProps,
          x: x - 50,
          y: y - 50,
          width: 100,
          height: 100,
          attrs: {
            ...baseProps.attrs,
            body: {
              ...baseProps.attrs.body,
              refPoints: '50,0 100,38 82,100 18,100 0,38',
            },
          },
        },
      }

      const config = nodeConfig[type as keyof typeof nodeConfig]
      if (config) {
        return createNodeWithPorts(graphRef.current, config)
      }
      return null
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
                stroke: '#A2B1C3',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 12,
                  height: 8,
                },
              },
            },
            zIndex: 0,
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
              fill: '#5F95FF',
              stroke: '#5F95FF',
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
          minWidth: 30,
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
      
      if (onSelectionChange) {
        onSelectionChange(nodes, edges)
      }
    })

    graph.on('node:dblclick', ({ node, e }) => {
      e.stopPropagation()
      
      const cellView = graph.findView(node)
      if (!cellView) return

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
      input.style.height = `${(bbox.height - 20) * zoom}px`
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

    const startNode = createNodeWithPorts(graph, {
      shape: 'rect',
      x: 300,
      y: 100,
      width: 120,
      height: 60,
      label: '开始',
      attrs: {
        body: {
          fill: '#91d5ff',
          stroke: '#1890ff',
          strokeWidth: 2,
          rx: 30,
          ry: 30,
        },
        label: {
          fill: '#0050b3',
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
    })

    const processNode = createNodeWithPorts(graph, {
      shape: 'rect',
      x: 300,
      y: 250,
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
    })

    const decisionNode = createNodeWithPorts(graph, {
      shape: 'polygon',
      x: 300,
      y: 400,
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
    })

    const endNode = createNodeWithPorts(graph, {
      shape: 'rect',
      x: 300,
      y: 580,
      width: 120,
      height: 60,
      label: '结束',
      attrs: {
        body: {
          fill: '#d9f7be',
          stroke: '#52c41a',
          strokeWidth: 2,
          rx: 30,
          ry: 30,
        },
        label: {
          fill: '#389e0d',
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
    })

    graph.addEdge({
      source: { cell: startNode.id, port: 'port-bottom' },
      target: { cell: processNode.id, port: 'port-top' },
      attrs: {
        line: {
          stroke: '#a2b1c3',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
        },
      },
    })

    graph.addEdge({
      source: { cell: processNode.id, port: 'port-bottom' },
      target: { cell: decisionNode.id, port: 'port-top' },
      attrs: {
        line: {
          stroke: '#a2b1c3',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
        },
      },
    })

    graph.addEdge({
      source: { cell: decisionNode.id, port: 'port-bottom' },
      target: { cell: endNode.id, port: 'port-top' },
      labels: [{ attrs: { text: { text: '是' } } }],
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
      graph.centerContent()
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

      const nodeTypes: ToolType[] = [
        'rect',
        'circle',
        'ellipse',
        'polygon',
        'diamond',
        'rounded-rect',
      ]

      if (nodeTypes.includes(currentTool)) {
        createNode(currentTool, point.x, point.y)
        onToolChange('select')
      }
    },
    [currentTool, createNode, onToolChange],
  )

  return (
    <div
      className="graph-canvas"
      ref={containerRef}
      onClick={handleCanvasClick}
    />
  )
}
