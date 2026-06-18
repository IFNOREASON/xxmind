import { Graph } from '@antv/x6'

export type ToolCategory = 'diagram' | 'converter'
export type DiagramType = 'flowchart' | 'fishbone' | 'architecture' | 'mindmap' | 'swimlane' | 'timeline'
export type ConverterType = 'word-to-pdf'
export type ToolType = DiagramType | ConverterType

export interface ToolConfig {
  type: ToolType
  category: ToolCategory
  name: string
  icon: string
  description: string
}

export interface BaseEditorProps {
  data?: any
  onChange?: (data: any) => void
  onGraphReady?: (graph: Graph) => void
  readonly?: boolean
}

export const DIAGRAM_TOOLS: ToolConfig[] = [
  {
    type: 'flowchart',
    category: 'diagram',
    name: '流程图',
    icon: '📊',
    description: '创建标准的流程图和业务流程图'
  },
  {
    type: 'swimlane',
    category: 'diagram',
    name: '泳道图',
    icon: '🏊',
    description: '创建跨职能泳道流程图，用于展示业务流程'
  },
  {
    type: 'fishbone',
    category: 'diagram',
    name: '鱼骨图',
    icon: '🐟',
    description: '创建鱼骨图（因果分析图）用于问题分析'
  },
  {
    type: 'timeline',
    category: 'diagram',
    name: '时间轴',
    icon: '📅',
    description: '创建时间轴历程图，展示项目发展里程碑'
  },
  {
    type: 'architecture',
    category: 'diagram',
    name: '架构图',
    icon: '🏗️',
    description: '创建系统架构和技术架构图'
  },
  {
    type: 'mindmap',
    category: 'diagram',
    name: '思维导图',
    icon: '🧠',
    description: '创建思维导图用于头脑风暴'
  }
]

export const CONVERTER_TOOLS: ToolConfig[] = [
  {
    type: 'word-to-pdf',
    category: 'converter',
    name: 'Word转PDF',
    icon: '📄',
    description: '将Word文档在线转换为PDF格式'
  }
]

export const ALL_TOOLS: ToolConfig[] = [...DIAGRAM_TOOLS, ...CONVERTER_TOOLS]

export function isDiagramTool(type: ToolType): type is DiagramType {
  return DIAGRAM_TOOLS.some(tool => tool.type === type)
}

export function isConverterTool(type: ToolType): type is ConverterType {
  return CONVERTER_TOOLS.some(tool => tool.type === type)
}
