import { useEffect, useState } from 'react'
import { ToolType, isDiagramTool, isConverterTool } from '../types/editor'
import { FlowChartEditor, FishboneEditor, WordToPdfEditor, MindMapEditor, SwimLaneEditor, TimelineEditor } from '../../lib'

interface EditorRendererProps {
  diagramType: ToolType
  onGraphReady?: (graph: any) => void
  data?: any
}

const PlaceholderEditor = ({ diagramType }: { diagramType: ToolType }) => {
  const configs: Record<string, { icon: string; name: string }> = {
    flowchart: { icon: '📊', name: '流程图' },
    swimlane: { icon: '🏊', name: '泳道图' },
    fishbone: { icon: '🐟', name: '鱼骨图' },
    timeline: { icon: '📅', name: '时间轴' },
    architecture: { icon: '🏗️', name: '架构图' },
    mindmap: { icon: '🧠', name: '思维导图' },
  }

  const config = configs[diagramType as string] || { icon: '🔧', name: '工具' }

  return (
    <div className="placeholder-editor">
      <div className="placeholder-content">
        <span className="placeholder-icon">{config.icon}</span>
        <h3>{config.name}编辑器</h3>
        <p>该编辑器正在开发中...</p>
        <p className="placeholder-tip">
          提示：在 <code>lib/</code> 目录下创建对应的编辑器组件
        </p>
      </div>
    </div>
  )
}

export default function EditorRenderer({ diagramType, onGraphReady, data }: EditorRendererProps) {
  const [editorData, setEditorData] = useState<any>(null)

  useEffect(() => {
    if (data && data.diagramType === diagramType) {
      setEditorData(data)
    } else {
      setEditorData(null)
    }
  }, [diagramType, data])

  if (isConverterTool(diagramType)) {
    switch (diagramType) {
      case 'word-to-pdf':
        return <WordToPdfEditor />
      default:
        return <PlaceholderEditor diagramType={diagramType} />
    }
  }

  switch (diagramType) {
    case 'flowchart':
      return <FlowChartEditor onGraphReady={onGraphReady} />
    case 'swimlane':
      return <SwimLaneEditor onGraphReady={onGraphReady} />
    case 'fishbone':
      return <FishboneEditor onGraphReady={onGraphReady} data={editorData} />
    case 'mindmap':
      return <MindMapEditor onGraphReady={onGraphReady} />
    case 'timeline':
      return <TimelineEditor onGraphReady={onGraphReady} />
    case 'architecture':
    default:
      return <PlaceholderEditor diagramType={diagramType} />
  }
}
