import { createContext, useContext } from 'react'
import { Graph, Node, Edge } from '@antv/x6'
import { ToolType } from './types'

interface FishboneContextType {
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
  clearAll: () => void
  resetDiagram: () => void
}

export const FishboneContext = createContext<FishboneContextType | null>(null)

export const useFishboneContext = () => {
  const context = useContext(FishboneContext)
  if (!context) {
    throw new Error('useFishboneContext must be used within FishboneProvider')
  }
  return context
}
