import { createContext, useContext } from 'react'
import { MindMapContextType } from './types'

export const MindMapContext = createContext<MindMapContextType>({
  graph: null,
  currentTool: 'select',
  setCurrentTool: () => {},
  selectedNodes: [],
  selectedEdges: [],
  zoomIn: () => {},
  zoomOut: () => {},
  zoomReset: () => {},
  fitCenter: () => {},
  undo: () => {},
  redo: () => {},
  deleteSelected: () => {},
  addChild: () => {},
  addSibling: () => {},
  resetDiagram: () => {},
})

export const useMindMapContext = () => useContext(MindMapContext)
