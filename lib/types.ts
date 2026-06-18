export interface BaseEditorProps {
  data?: any
  onChange?: (data: any) => void
  readonly?: boolean
  height?: number | string
  width?: number | string
}

export type { NodeData, EdgeData } from './FlowChartEditor/types'
