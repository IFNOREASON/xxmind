import { Graph, Node } from '@antv/x6'

export interface TimelineEventData {
  id: string
  date: string
  year: number
  month: number
  title: string
  description: string
  color: string
  type?: string
  x?: number
  y?: number
}

export interface TimelineAxisData {
  id: string
  startYear: number
  endYear: number
  x: number
  y: number
  width: number
}

export interface TimelineEditorProps {
  initialData?: TimelineEventData[]
  data?: any
  onEventChange?: (events: TimelineEventData[]) => void
  onGraphReady?: (graph: Graph, shapeManager: any) => void
}

export type ToolType =
  | 'select'
  | 'hand'
  | 'addEvent'
  | 'delete'

export interface TimelineContextType {
  graph: Graph | null
  currentTool: ToolType
  setCurrentTool: (tool: ToolType) => void
  selectedNodes: Node[]
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void
  fitCenter: () => void
  undo: () => void
  redo: () => void
  deleteSelected: () => void
  addEvent: () => void
  resetTimeline: () => void
}

export const EVENT_COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa8c16',
]
