import { useEffect, useRef, useCallback, useState } from 'react'
import { Graph, Node, Edge, Selection, Keyboard, Clipboard, History } from '@antv/x6'
import { MindMapEditorProps, ToolType, MindMapNodeData } from './types'
import { MindMapShapeManager, NODE_COLORS } from './MindMapShapeManager'
import './GraphCanvas.css'

interface GraphCanvasProps extends MindMapEditorProps {
  currentTool: ToolType
  onToolChange: (tool: ToolType) => void
  onGraphReady: (graph: Graph, shapeManager: MindMapShapeManager) => void
  onSelectionChange: (nodes: Node[], edges: Edge[]) => void
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
  const shapeManagerRef = useRef<MindMapShapeManager | null>(null)
  const [isReady, setIsReady] = useState(false)
  const pasteOffsetRef = useRef({ x: 20, y: 20 })
  const editingInputRef = useRef<HTMLInputElement | null>(null)
  const createChildNodeRef = useRef<(parentNode: Node) => void>()
  const createSiblingNodeRef = useRef<(node: Node) => void>()

  createChildNodeRef.current = useCallback((parentNode: Node) => {
    if (!graphRef.current || !shapeManagerRef.current) return

    const graph = graphRef.current
    const shapeManager = shapeManagerRef.current
    const parentData = parentNode.getData() as MindMapNodeData
    const parentLevel = parentData?.level

    if (editingInputRef.current) {
      editingInputRef.current.blur()
    }

    if (parentLevel === 'root') {
      const primaryRight = graph.getNodes().filter(
        (n) => n.getData()?.level === 'primary' && n.getData()?.direction === 'right'
      )
      const primaryLeft = graph.getNodes().filter(
        (n) => n.getData()?.level === 'primary' && n.getData()?.direction === 'left'
      )
      const direction: 'left' | 'right' = primaryRight.length > primaryLeft.length ? 'left' : 'right'
      const node = shapeManager.createPrimaryNode(`新主题`, parentNode.id, direction)
      setTimeout(() => {
        shapeManager.layoutNodes()
        graph.cleanSelection()
        graph.select(node)
      }, 0)
    } else if (parentLevel === 'primary' || parentLevel === 'secondary') {
      const node = shapeManager.createSecondaryNode(`新子主题`, parentNode.id)
      setTimeout(() => {
        shapeManager.layoutNodes()
        graph.cleanSelection()
        graph.select(node)
      }, 0)
    }
  }, [])

  createSiblingNodeRef.current = useCallback((node: Node) => {
    if (!graphRef.current || !shapeManagerRef.current) return

    const graph = graphRef.current
    const shapeManager = shapeManagerRef.current
    const data = node.getData() as MindMapNodeData

    if (data.level === 'root') return

    if (editingInputRef.current) {
      editingInputRef.current.blur()
    }

    if (data.parentId) {
      const parentNode = graph.getCellById(data.parentId) as Node
      const parentData = parentNode.getData() as MindMapNodeData

      if (parentData.level === 'root') {
        const direction = data.direction || 'right'
        const newNode = shapeManager.createPrimaryNode(`新主题`, data.parentId, direction)
        setTimeout(() => {
          shapeManager.layoutNodes()
          graph.cleanSelection()
          graph.select(newNode)
        }, 0)
      } else if (parentData.level === 'primary') {
        const newNode = shapeManager.createSecondaryNode(`新子主题`, data.parentId)
        setTimeout(() => {
          shapeManager.layoutNodes()
          graph.cleanSelection()
          graph.select(newNode)
        }, 0)
      }
    }
  }, [])

  const createChildNode = useCallback((parentNode: Node) => {
    if (createChildNodeRef.current) {
      createChildNodeRef.current(parentNode)
    }
  }, [])

  const createSiblingNode = useCallback((node: Node) => {
    if (createSiblingNodeRef.current) {
      createSiblingNodeRef.current(node)
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const graph = new Graph({
      container: containerRef.current,
      grid: {
        size: 10,
        visible: true,
        type: 'dot',
        args: {
          color: '#e0e0e0',
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
        minScale: 0.3,
        maxScale: 3,
      },
      interacting: (cellView) => {
        return {
          nodeMovable: true,
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

    const shapeManager = new MindMapShapeManager(graph)
    shapeManagerRef.current = shapeManager

    shapeManager.initializeDefaultMindMap()

    graph.bindKey('delete', () => {
      const cells = graph.getSelectedCells()
      if (cells.length > 0) {
        cells.forEach((cell) => {
          if (cell.isNode()) {
            const data = cell.getData() as MindMapNodeData
            if (data?.level !== 'root') {
              shapeManager.deleteNode(cell as Node)
            }
          } else {
            graph.removeCell(cell)
          }
        })
      }
    })

    graph.bindKey('backspace', () => {
      const cells = graph.getSelectedCells()
      if (cells.length > 0) {
        cells.forEach((cell) => {
          if (cell.isNode()) {
            const data = cell.getData() as MindMapNodeData
            if (data?.level !== 'root') {
              shapeManager.deleteNode(cell as Node)
            }
          } else {
            graph.removeCell(cell)
          }
        })
      }
    })

    graph.bindKey('ctrl+c', () => {
      const cells = graph.getSelectedCells()
      if (cells.length > 0) {
        const clipboard = graph.getPlugin('clipboard') as any
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
          offset: { x: offset.x, y: offset.y },
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

    graph.bindKey('tab', () => {
      const selectedNodes = graph.getSelectedCells().filter(
        (cell) => cell.isNode()
      ) as Node[]

      if (selectedNodes.length === 1) {
        createChildNode(selectedNodes[0])
      }
    })

    graph.bindKey('enter', () => {
      const selectedNodes = graph.getSelectedCells().filter(
        (cell) => cell.isNode()
      ) as Node[]

      if (selectedNodes.length === 1) {
        createSiblingNode(selectedNodes[0])
      }
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

      const text = node.attr('label/text') || ''
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
      input.style.borderRadius = '8px'

      const container = containerRef.current
      if (!container) return

      container.appendChild(input)
      input.focus()
      input.select()
      editingInputRef.current = input

      const finish = () => {
        const newText = input.value
        shapeManager.updateNodeStyle(node, { label: newText })
        if (container.contains(input)) {
          container.removeChild(input)
        }
        editingInputRef.current = null
        graph.cleanSelection()
        graph.select(node)
        shapeManager.layoutNodes()
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
        if (e.key === 'Tab') {
          e.preventDefault()
          input.blur()
          createChildNode(node)
        }
      })
    })

    graph.on('node:moved', ({ node }) => {
      shapeManager.updateConnectedEdges(node)
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

    graph.centerContent()
    graph.zoomTo(0.9)

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
  }, [onGraphReady, onSelectionChange])

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

  return (
    <div
      className="graph-canvas mindmap"
      ref={containerRef}
    />
  )
}
