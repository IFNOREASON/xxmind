import { createContext, useContext } from 'react'
import { Graph, Node, Edge } from '@antv/x6'
import { ToolType, SwimLaneData } from './types'

export interface SwimLaneContextValue {
  graph: Graph | null
  currentTool: ToolType
  setCurrentTool: (tool: ToolType) => void
  selectedNodes: Node[]
  selectedEdges: Edge[]
  selectedLanes: string[]
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void
  fitCenter: () => void
  undo: () => void
  redo: () => void
  deleteSelected: () => void
  copy: () => void
  paste: () => void
  addLane: (isHorizontal: boolean) => void
  clearLane: (laneId: string) => void
  deleteLane: (laneId: string) => void
  updateLaneName: (laneId: string, name: string) => void
}

export const SwimLaneContext = createContext<SwimLaneContextValue>({} as SwimLaneContextValue)

export const useSwimLaneContext = () => useContext(SwimLaneContext)
