import { Graph, Node, Edge } from '@antv/x6'
import { MindMapShapeManager } from './MindMapShapeManager'

export type MindMapNodeLevel = 'root' | 'primary' | 'secondary'

export interface MindMapNodeData {
  id: string
  label: string
  level: MindMapNodeLevel
  fillColor: string
  fontColor: string
  x?: number
  y?: number
  parentId?: string
  children?: string[]
  direction?: 'left' | 'right'
}

export interface MindMapEditorProps {
  initialData?: MindMapNodeData[]
  data?: any
  onNodeChange?: (nodes: Node[]) => void
  onGraphReady?: (graph: Graph, shapeManager: MindMapShapeManager) => void
}

export type ToolType =
  | 'select'
  | 'hand'
  | 'addChild'
  | 'addSibling'
  | 'delete'

export interface MindMapContextType {
  graph: Graph | null
  currentTool: ToolType
  setCurrentTool: (tool: ToolType) => void
  selectedNodes: Node[]
  selectedEdges: Edge[]
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void
  fitCenter: () => void
  undo: () => void
  redo: () => void
  deleteSelected: () => void
  addChild: () => void
  addSibling: () => void
  resetDiagram: () => void
}
