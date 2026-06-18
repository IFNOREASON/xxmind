import { useCallback, useState, useRef } from 'react'
import { Graph, Node, Edge } from '@antv/x6'
import { MindMapEditorProps, ToolType, MindMapNodeData } from './types'
import GraphCanvas from './GraphCanvas'
import Toolbar from './Toolbar'
import PropertyPanel from './PropertyPanel'
import { MindMapShapeManager } from './MindMapShapeManager'
import './MindMapEditor.css'

export default function MindMapEditor(props: MindMapEditorProps) {
  const [graph, setGraph] = useState<Graph | null>(null)
  const [currentTool, setCurrentTool] = useState<ToolType>('select')
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([])
  const shapeManagerRef = useRef<MindMapShapeManager | null>(null)

  const handleGraphReady = useCallback(
    (g: Graph, shapeManager: MindMapShapeManager) => {
      setGraph(g)
      shapeManagerRef.current = shapeManager
      if (props.onGraphReady) {
        props.onGraphReady(g, shapeManager)
      }
    },
    [props],
  )

  const handleSelectionChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setSelectedNodes(nodes)
    setSelectedEdges(edges)
  }, [])

  const handleUpdateNode = useCallback((node: Node, updates: { fillColor?: string; fontColor?: string; label?: string }) => {
    if (shapeManagerRef.current) {
      shapeManagerRef.current.updateNodeStyle(node, updates)
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
    if (graph && shapeManagerRef.current) {
      const cells = graph.getSelectedCells()
      cells.forEach((cell) => {
        if (cell.isNode()) {
          const data = cell.getData() as MindMapNodeData
          if (data?.level !== 'root') {
            shapeManagerRef.current!.deleteNode(cell as Node)
            shapeManagerRef.current!.layoutNodes()
          }
        }
      })
    }
  }, [graph])

  const handleAddChild = useCallback(() => {
    if (graph && shapeManagerRef.current && selectedNodes.length === 1) {
      const parentNode = selectedNodes[0]
      const parentData = parentNode.getData() as MindMapNodeData

      if (parentData.level === 'root') {
        const primaryRight = graph.getNodes().filter(
          (n) => n.getData()?.level === 'primary' && n.getData()?.direction === 'right'
        )
        const primaryLeft = graph.getNodes().filter(
          (n) => n.getData()?.level === 'primary' && n.getData()?.direction === 'left'
        )
        const direction: 'left' | 'right' = primaryRight.length > primaryLeft.length ? 'left' : 'right'
        const node = shapeManagerRef.current.createPrimaryNode('新主题', parentNode.id, direction)
        setTimeout(() => {
          shapeManagerRef.current!.layoutNodes()
          graph.cleanSelection()
          graph.select(node)
        }, 0)
      } else if (parentData.level === 'primary' || parentData.level === 'secondary') {
        const node = shapeManagerRef.current.createSecondaryNode('新子主题', parentNode.id)
        setTimeout(() => {
          shapeManagerRef.current!.layoutNodes()
          graph.cleanSelection()
          graph.select(node)
        }, 0)
      }
    }
  }, [graph, selectedNodes])

  const handleAddSibling = useCallback(() => {
    if (graph && shapeManagerRef.current && selectedNodes.length === 1) {
      const node = selectedNodes[0]
      const data = node.getData() as MindMapNodeData

      if (data.level === 'root') return

      if (data.parentId) {
        const parentNode = graph.getCellById(data.parentId) as Node
        const parentData = parentNode.getData() as MindMapNodeData

        if (parentData.level === 'root') {
          const direction = data.direction || 'right'
          const newNode = shapeManagerRef.current.createPrimaryNode('新主题', data.parentId, direction)
          setTimeout(() => {
            shapeManagerRef.current!.layoutNodes()
            graph.cleanSelection()
            graph.select(newNode)
          }, 0)
        } else if (parentData.level === 'primary') {
          const newNode = shapeManagerRef.current.createSecondaryNode('新子主题', data.parentId)
          setTimeout(() => {
            shapeManagerRef.current!.layoutNodes()
            graph.cleanSelection()
            graph.select(newNode)
          }, 0)
        }
      }
    }
  }, [graph, selectedNodes])

  const handleResetDiagram = useCallback(() => {
    if (graph && shapeManagerRef.current) {
      graph.clearCells()
      shapeManagerRef.current.initializeDefaultMindMap()
      setSelectedNodes([])
      setSelectedEdges([])
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
    <div className="mindmap-editor">
      <Toolbar
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDelete={handleDeleteSelected}
        onAddChild={handleAddChild}
        onAddSibling={handleAddSibling}
        onResetDiagram={handleResetDiagram}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitCenter={handleFitCenter}
      />
      <div className="mindmap-editor-content">
        <div className="mindmap-editor-canvas">
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
          selectedEdges={selectedEdges}
          onUpdateNode={handleUpdateNode}
        />
      </div>
    </div>
  )
}
