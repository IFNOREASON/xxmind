import { Graph, Node, Edge } from '@antv/x6'

export type FishboneStyle = 'classic' | 'right-angle' | 'rounded' | 'modern'

export interface FishboneNodeData {
  id: string
  label: string
  level: 'problem' | 'category' | 'cause' | 'subcause'
  color: string
  x?: number
  y?: number
  parentId?: string
  children?: string[]
  direction?: number
  categoryIndex?: number
  causeIndex?: number
}

export interface FishboneEditorProps {
  initialData?: FishboneNodeData[]
  data?: any
  initialStyle?: FishboneStyle
  onNodeChange?: (nodes: Node[]) => void
  onGraphReady?: (graph: Graph) => void
  onStyleChange?: (style: FishboneStyle) => void
}

export type ToolType =
  | 'select'
  | 'hand'