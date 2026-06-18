import { Graph, Node, Edge } from '@antv/x6'

export interface NodeData {
  id: string
  type: 'rect' | 'circle' | 'ellipse' | 'polygon' | 'diamond' | 'rounded-rect'
  label: string
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
}

export interface EdgeData {
  id: string
  source: string
  target: string
  label?: string
  sourcePort?: string
  targetPort?: string
}

export interface FlowChartEditorProps {
  initialNodes?: NodeData[]
  initialEdges?: EdgeData[]
  onNodeChange?: (nodes: Node[]) => void
  onEdgeChange?: (edges: Edge[]) => void
  onGraphReady?: (graph: Graph) => void
}

export type ToolType =
  | 'select'
  | 'hand'
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'polygon'
  | 'diamond'
  | 'rounded-rect'
  | 'edge'
