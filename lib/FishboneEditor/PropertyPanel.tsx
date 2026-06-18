import { Node, Edge } from '@antv/x6'
import './PropertyPanel.css'

interface PropertyPanelProps {
  selectedNodes: Node[]
  selectedEdges: Edge[]
  onUpdateNode: (node: Node, updates: Record<string, any>) => void
}

export default function PropertyPanel({
  selectedNodes,
  selectedEdges,
  onUpdateNode,
}: PropertyPanelProps) {
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null
  const selectedEdge = selectedEdges.length === 1 ? selectedEdges[0] : null

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="property-panel">
        <div className="property-panel-empty">
          <div className="empty-icon">🐟</div>
          <p>选择一个节点或连线</p>
          <p className="empty-hint">查看和编辑属性</p>
        </div>
      </div>
    )
  }

  if (selectedNode) {
    const nodeData = selectedNode.getData()
    const getLabel = () => {
      try {
        return selectedNode.attr('label/text') ||
               selectedNode.attr('text/text') || ''
      } catch {
        return ''
      }
    }
    const getFill = () => {
      try {
        const fill = selectedNode.attr('body/fill') ||
                     selectedNode.attr('rect/fill') || '#ffffff'
        return typeof fill === 'string' ? fill : '#ffffff'
      } catch {
        return '#ffffff'
      }
    }
    const getStroke = () => {
      try {
        const stroke = selectedNode.attr('body/stroke') ||
                       selectedNode.attr('rect/stroke') || '#1890ff'
        return typeof stroke === 'string' ? stroke : '#1890ff'
      } catch {
        return '#1890ff'
      }
    }
    const getStrokeWidth = () => {
      try {
        const strokeWidth = selectedNode.attr('body/strokeWidth') ||
                           selectedNode.attr('rect/strokeWidth') || 2
        return typeof strokeWidth === 'number' ? strokeWidth : 2
      } catch {
        return 2
      }
    }
    const label = getLabel()
    const fill = getFill()
    const stroke = getStroke()
    const strokeWidth = getStrokeWidth()
    const x = selectedNode.position().x
    const y = selectedNode.position().y
    const width = selectedNode.size().width
    const height = selectedNode.size().height
    const shape = selectedNode.shape
    const level = nodeData?.level || 'unknown'

    const levelLabels: Record<string, string> = {
      problem: '问题标题',
      category: '分类节点',
      cause: '原因节点',
      subcause: '子原因节点',
      unknown: '未知类型',
    }

    return (
      <div className="property-panel">
        <div className="property-panel-header">
          <h3>节点属性</h3>
          <span className="node-type">{levelLabels[level] || shape}</span>
        </div>

        <div className="property-section">
          <h4 className="section-title">基础信息</h4>
          <div className="property-item">
            <label>ID</label>
            <span className="property-value mono">{selectedNode.id}</span>
          </div>
          <div className="property-item">
            <label>标签</label>
            <input
              type="text"
              value={label as string}
              onChange={(e) => {
                onUpdateNode(selectedNode, {
                  attrs: { label: { text: e.target.value } },
                })
              }}
              className="property-input"
            />
          </div>
          <div className="property-item">
            <label>层级</label>
            <span className="property-value">{levelLabels[level] || level}</span>
          </div>
        </div>

        <div className="property-section">
          <h4 className="section-title">位置</h4>
          <div className="property-row">
            <div className="property-item half">
              <label>X</label>
              <input
                type="number"
                value={Math.round(x)}
                onChange={(e) => {
                  onUpdateNode(selectedNode, {
                    x: Number(e.target.value),
                  })
                }}
                className="property-input"
              />
            </div>
            <div className="property-item half">
              <label>Y</label>
              <input
                type="number"
                value={Math.round(y)}
                onChange={(e) => {
                  onUpdateNode(selectedNode, {
                    y: Number(e.target.value),
                  })
                }}
                className="property-input"
              />
            </div>
          </div>
        </div>

        <div className="property-section">
          <h4 className="section-title">样式</h4>
          <div className="property-item">
            <label>填充颜色</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={fill as string}
                onChange={(e) => {
                  onUpdateNode(selectedNode, {
                    attrs: { body: { fill: e.target.value }, rect: { fill: e.target.value } },
                  })
                }}
                className="color-input"
              />
              <span className="color-value">{fill}</span>
            </div>
          </div>
          <div className="property-item">
            <label>边框颜色</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={stroke as string}
                onChange={(e) => {
                  onUpdateNode(selectedNode, {
                    attrs: { body: { stroke: e.target.value }, rect: { stroke: e.target.value } },
                  })
                }}
                className="color-input"
              />
              <span className="color-value">{stroke}</span>
            </div>
          </div>
          <div className="property-item">
            <label>边框宽度</label>
            <input
              type="number"
              min="0"
              max="20"
              value={strokeWidth as number}
              onChange={(e) => {
                onUpdateNode(selectedNode, {
                  attrs: { body: { strokeWidth: Number(e.target.value) }, rect: { strokeWidth: Number(e.target.value) } },
                })
              }}
              className="property-input"
            />
          </div>
        </div>
      </div>
    )
  }

  if (selectedEdge) {
    const getStroke = () => {
      try {
        const stroke = selectedEdge.attr('line/stroke') || '#a2b1c3'
        return typeof stroke === 'string' ? stroke : '#a2b1c3'
      } catch {
        return '#a2b1c3'
      }
    }
    const getStrokeWidth = () => {
      try {
        const strokeWidth = selectedEdge.attr('line/strokeWidth') || 2
        return typeof strokeWidth === 'number' ? strokeWidth : 2
      } catch {
        return 2
      }
    }
    const stroke = getStroke()
    const strokeWidth = getStrokeWidth()

    return (
      <div className="property-panel">
        <div className="property-panel-header">
          <h3>连线属性</h3>
          <span className="node-type">bone</span>
        </div>

        <div className="property-section">
          <h4 className="section-title">基础信息</h4>
          <div className="property-item">
            <label>ID</label>
            <span className="property-value mono">{selectedEdge.id}</span>
          </div>
        </div>

        <div className="property-section">
          <h4 className="section-title">样式</h4>
          <div className="property-item">
            <label>线条颜色</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={stroke as string}
                onChange={(e) => {
                  selectedEdge.attr('line/stroke', e.target.value)
                }}
                className="color-input"
              />
              <span className="color-value">{stroke}</span>
            </div>
          </div>
          <div className="property-item">
            <label>线条宽度</label>
            <input
              type="number"
              min="1"
              max="10"
              value={strokeWidth as number}
              onChange={(e) => {
                selectedEdge.attr('line/strokeWidth', Number(e.target.value))
              }}
              className="property-input"
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}
