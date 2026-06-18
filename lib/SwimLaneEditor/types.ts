import { Graph, Node, Edge } from '@antv/x6'

export interface SwimLaneData {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  color: string
  isHorizontal: boolean
}

export interface FlowNodeData {
  id: string
  type: 'start' | 'process' | 'decision' | 'end'
  label: string
  description: string
  x: number
  y: number
  width: number
  height: number
  laneId?: string
}

export interface FlowEdgeData {
  id: string
  source: string
  target: string
  label?: string
}

export interface SwimLaneEditorProps {
  initialLanes?: SwimLaneData[]
  initialNodes?: FlowNodeData[]
  initialEdges?: FlowEdgeData[]
  onLaneChange?: (lanes: SwimLaneData[]) => void
  onNodeChange?: (nodes: FlowNodeData[]) => void
  onEdgeChange?: (edges: FlowEdgeData[]) => void
  onGraphReady?: (graph: Graph) => void
  data?: any
}

export type ToolType =
  | 'select'
  | 'hand'
  | 'start'
  | 'process'
  | 'decision'
  | 'end'
  | 'lane-vertical'
  | 'lane-horizontal'
