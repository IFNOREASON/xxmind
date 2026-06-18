import { createContext, useContext } from 'react'
import { Graph, Node, Edge } from '@antv/x6'
import { ToolType } from './types'

interface FlowChartContextType {
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
  copy: () => void
  paste: () => void
}

export const FlowChartContext = createContext<FlowChartContextType | null>(null)

export const useFlowChartContext = () => {
  const context = useContext(FlowChartContext)
  if (!context) {
    throw new Error('useFlowChartContext must be used within FlowChartProvider')
  }
  return context
}
