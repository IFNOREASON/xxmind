import { useEffect, useRef, useCallback, useState } from 'react'
import { Graph, Node, Edge, Selection, Keyboard, Clipboard, History } from '@antv/x6'
import { FishboneEditorProps, ToolType, FishboneStyle, FishboneNodeData } from './types'
import { FishboneShapeManager } from './FishboneShapeManager'
import './GraphCanvas.css'

interface GraphCanvasProps extends FishboneEditorProps {
  currentTool: ToolType
  currentStyle: FishboneStyle
  onToolChange: (tool: ToolType) => void
  onGraphReady: (graph: Graph) => void
  onSelectionChange: (nodes: Node[], edges: Edge[]) => void
  onStyleChange: (style: FishboneStyle) => void
}

const CATEGORY_COLORS = [
  '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
  '#fd79a8', '#a29bfe', '#74b9ff', '#ff7675',
]

export default function GraphCanvas({
  initialData,
  initialStyle = 'classic',
  onGraphReady,
  onSelectionChange,
  currentTool,
  currentStyle,
  onToolChange,
  onStyleChange,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)
  const shapeManagerRef = useRef<FishboneShapeManager | null>(null)
  const [isReady, setIsReady] = useState(false)
  const pasteOffsetRef = useRef({ x: 20, y: 20 })
  const nodeCounterRef = useRef(0)

  const createChildNode = useCallback((parentNode: Node) => {
    if (!graphRef.current || !shapeManagerRef.current) return

    const graph = graphRef.current
    const shapeManager = shapeManagerRef.current
    const parentData = parentNode.getData() as FishboneNodeData
    const parentLevel = parentData?.level

    nodeCounterRef.current += 1

    if (parentLevel === 'problem') {
      const categoryNodes = graph.getNodes().filter(n => n.getData()?.level === 'category')
      const index = categoryNodes.length
      const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      
      const { node } = shapeManager.createCategoryNode(
        `新分类${index + 1}`,
        index,
        index + 1,
        color
      )
      
      shapeManager.layoutNodes()
      graph.select(node)
    } else if (parentLevel === 'category') {
      const causeNodes = graph.getNodes().filter(
        n => n.getData()?.level === 'cause' && n.getData()?.parentId === parentNode.id
      )
      const categoryNodes = graph.getNodes().filter(n => n.getData()?.level === 'category')
      const catIndex = categoryNodes.findIndex(n => n.id === parentNode.id)
      
      const { node } = shapeManager.createCauseNode(
        `新原因${causeNodes.length + 1}`,
        parentNode.id,
        catIndex,
        causeNodes.length,
        causeNodes.length + 1,
        parentData.color || CATEGORY_COLORS[0]
      )
      
      shapeManager.layoutNodes()
      graph.select(node)
    } else if (parentLevel === 'cause') {
      const subcauseNodes = graph.getNodes().filter(
        n => n.getData()?.level === 'subcause' && n.getData()?.parentId === parentNode.id
      )
      const categoryNodes = graph.getNodes().filter(n => n.getData()?.level === 'category')
      const catIndex = categoryNodes.findIndex(n => n.id === parentData.parentId)
      
      const { node } = shapeManager.createSubcauseNode(
        `子因${subcauseNodes.length + 1}`,
        parentNode.id,
        catIndex,
        subcauseNodes.length,
        parentData.color || CATEGORY_COLORS[0]
      )
      
      shapeManager.layoutNodes()
      graph.select(node)
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
        minScale: 0.5,
        maxScale: 2,
      },
      interacting: (cellView) => {
        const data = cellView.cell.getData()
        if (data?.level === 'bone' || data?.level === 'spine') {
          return {
            nodeMovable: false,
            nodeResizable: false,
            nodeRotatable: false,
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

    const shapeManager = new FishboneShapeManager(graph, initialStyle)
    shapeManagerRef.current = shapeManager

    shapeManager.createSpine()
    shapeManager.createProblemNode('问题描述')

    const categories = ['人员', '方法', '材料', '机器', '环境', '测量']
    categories.forEach((cat, index) => {
      const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      const { node: categoryNode } = shapeManager.createCategoryNode(
        cat,
        index,
        categories.length,
        color
      )
      
      for (let i = 0; i < 2; i++) {
        shapeManager.createCauseNode(
          `原因${i + 1}`,
          categoryNode.id,
          index,
          i,
          2,
          color
        )
      }
    })

    shapeManager.layoutNodes()

    graph.bindKey('delete', () => {
      const cells = graph.getSelectedCells()
      if (cells.length > 0) {
        const deletableCells = cells.filter(cell => {
          const data = cell.getData()
          return data?.level !== 'spine' && data?.level !== 'bone'
        })
        if (deletableCells.length > 0) {
          graph.removeCells(deletableCells)
          shapeManager.layoutNodes()
        }
      }
    })

    graph.bindKey('backspace', () => {
      const cells = graph.getSelectedCells()
      if (cells.length > 0) {
        const deletableCells = cells.filter(cell => {
          const data = cell.getData()
          return data?.level !== 'spine' && data?.level !== 'bone'
        })
        if (deletableCells.length > 0) {
          graph.removeCells(deletableCells)
          shapeManager.layoutNodes()
        }
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
        shapeManager.updateAllBones()
      }
    })

    graph.bindKey('ctrl+x', () => {
      const cells = graph.getSelectedCells()
      if (cells.length > 0) {
        const clipboard = graph.getPlugin('clipboard') as any
        if (clipboard) {
          clipboard.cut(cells)
          shapeManager.layoutNodes()
        }
      }
    })

    graph.bindKey('ctrl+z', () => {
      const history = graph.getPlugin('history') as any
      if (history && history.canUndo()) {
        history.undo()
        shapeManager.updateAllBones()
      }
    })

    graph.bindKey('ctrl+y', () => {
      const history = graph.getPlugin('history') as any
      if (history && history.canRedo()) {
        history.redo()
        shapeManager.updateAllBones()
      }
    })

    graph.bindKey('ctrl+a', () => {
      const nodes = graph.getNodes()
      const edges = graph.getEdges()
      graph.select([...nodes, ...edges])
    })

    graph.bindKey('tab', () => {
      const selectedNodes = graph.getSelectedCells().filter(
        cell => cell.isNode() && cell.getData()?.level !== 'spine' && cell.getData()?.level !== 'bone'
      ) as Node[]
      
      if (selectedNodes.length === 1) {
        createChildNode(selectedNodes[0])
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
      
      const cellView = graph.findView(node)
      if (!cellView) return

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
      })
    })

    graph.on('node:moved', () => {
      shapeManager.updateAllBones()
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
    graph.zoomTo(0.85)

    graphRef.current = graph
    setIsReady(true)

    if (onGraphReady) {
      onGraphReady(graph)
    }

    return () => {
      graph.dispose()
      graphRef.current = null
      shapeManagerRef.current = null
    }
  }, [initialStyle, createChildNode, onGraphReady, onSelectionChange])

  useEffect(() => {
    if (!graphRef.current || !shapeManagerRef.current || !isReady) return

    shapeManagerRef.current.redrawWithNewStyle(currentStyle)
    onStyleChange(currentStyle)
  }, [currentStyle, isReady, onStyleChange])

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
      className="graph-canvas"
      ref={containerRef}
    />
  )
}
