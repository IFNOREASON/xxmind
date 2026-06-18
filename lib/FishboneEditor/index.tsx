import { useCallback, useState, useRef } from 'react'
import { Graph, Node, Edge } from '@antv/x6'
import { FishboneContext } from './context'
import { FishboneEditorProps, ToolType, FishboneStyle, FishboneNodeData } from './types'
import GraphCanvas from './GraphCanvas'
import Toolbar from './Toolbar'
import PropertyPanel from './PropertyPanel'
import { FishboneShapeManager } from './FishboneShapeManager'
import './FishboneEditor.css'

export default function FishboneEditor(props: FishboneEditorProps) {
  const [graph, setGraph] = useState<Graph | null>(null)
  const [currentTool, setCurrentTool] = useState<ToolType>('select')
  const [currentStyle, setCurrentStyle] = useState<FishboneStyle>(props.initialStyle || 'classic')
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([])
  const [pasteOffset, setPasteOffset] = useState({ x: 20, y: 20 })
  const shapeManagerRef = useRef<FishboneShapeManager | null>(null)

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

  const handleStyleChange = useCallback((style: FishboneStyle) => {
    setCurrentStyle(style)
    if (props.onStyleChange) {
      props.onStyleChange(style)
    }
  }, [props])

  const handleUpdateNode = useCallback((node: Node, updates: Record<string, any>) => {
    if (updates.attrs) {
      Object.keys(updates.attrs).forEach((key) => {
        node.attr(key, updates.attrs[key])
      })
    }
    if (updates.x !== undefined || updates.y !== undefined) {
      node.position(updates.x ?? node.position().x, updates.y ?? node.position().y)
    }
  }, [])

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
      const cells = graph.getSelectedCells()
      const deletableCells = cells.filter(cell => {
        const data = cell.getData()
        return data?.level !== 'spine'
      })
      if (deletableCells.length > 0) {
        graph.removeCells(deletableCells)
        setSelectedNodes([])
        setSelectedEdges([])
      }
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

  const handleClearAll = useCallback(() => {
    if (graph) {
      const nodes = graph.getNodes()
      const edges = graph.getEdges()
      graph.removeCells([...nodes, ...edges])
      setSelectedNodes([])
      setSelectedEdges([])
    }
  }, [graph])

  const handleResetDiagram = useCallback(() => {
    if (graph) {
      graph.clearCells()
      setSelectedNodes([])
      setSelectedEdges([])
      
      const CATEGORY_COLORS = [
        '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
        '#fd79a8', '#a29bfe', '#74b9ff', '#ff7675',
      ]

      const shapeManager = new FishboneShapeManager(graph, currentStyle)
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

      graph.centerContent()
      graph.zoomTo(0.85)
    }
  }, [graph, currentStyle])

  const contextValue = {
    graph,
    currentTool,
    setCurrentTool: handleToolChange,
    selectedNodes,
    selectedEdges,
    zoomIn: () => {},
    zoomOut: () => {},
    zoomReset: () => {},
    fitCenter: () => {},
    undo: handleUndo,
    redo: handleRedo,
    deleteSelected: handleDeleteSelected,
    copy: handleCopy,
    paste: handlePaste,
    clearAll: handleClearAll,
    resetDiagram: handleResetDiagram,
  }

  return (
    <FishboneContext.Provider value={contextValue}>
      <div className="fishbone-editor">
        <Toolbar
          currentTool={currentTool}
          currentStyle={currentStyle}
          onToolChange={handleToolChange}
          onStyleChange={handleStyleChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDelete={handleDeleteSelected}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onClearAll={handleClearAll}
          onResetDiagram={handleResetDiagram}
        />
        <div className="fishbone-editor-content">
          <div className="fishbone-editor-canvas">
            <GraphCanvas
              {...props}
              currentTool={currentTool}
              currentStyle={currentStyle}
              onToolChange={handleToolChange}
              onGraphReady={handleGraphReady}
              onSelectionChange={handleSelectionChange}
              onStyleChange={handleStyleChange}
            />
          </div>
          <PropertyPanel
            selectedNodes={selectedNodes}
            selectedEdges={selectedEdges}
            onUpdateNode={handleUpdateNode}
          />
        </div>
      </div>
    </FishboneContext.Provider>
  )
}
