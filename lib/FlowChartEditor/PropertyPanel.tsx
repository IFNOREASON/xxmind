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
          <div className="empty-icon">📐</div>
          <p>选择一个节点或连线</p>
          <p className="empty-hint">查看和编辑属性</p>
        </div>
      </div>
    )
  }

  if (selectedNode) {
    const nodeData = selectedNode.getData()
    const label = (selectedNode.getAttrByPath('label/text') || selectedNode.getAttrByPath('text/text') || '') as string
    const fill = (selectedNode.getAttrByPath('body/fill') || '#ffffff') as string
    const stroke = (selectedNode.getAttrByPath('body/stroke') || '#1890ff') as string
    const strokeWidth = (selectedNode.getAttrByPath('body/strokeWidth') || 2) as number
    const x = selectedNode.position().x
    const y = selectedNode.position().y
    const width = selectedNode.size().width
    const height = selectedNode.size().height
    const shape = selectedNode.shape

    return (
      <div className="property-panel">
        <div className="property-panel-header">
          <h3>节点属性</h3>
          <span className="node-type">{shape}</span>
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
        </div>

        <div className="property-section">
          <h4 className="section-title">位置与尺寸</h4>
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
          <div className="property-row">
            <div className="property-item half">
              <label>宽度</label>
              <input
                type="number"
                value={Math.round(width)}
                onChange={(e) => {
                  onUpdateNode(selectedNode, {
                    width: Number(e.target.value),
                  })
                }}
                className="property-input"
              />
            </div>
            <div className="property-item half">
              <label>高度</label>
              <input
                type="number"
                value={Math.round(height)}
                onChange={(e) => {
                  onUpdateNode(selectedNode, {
                    height: Number(e.target.value),
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
                    attrs: { body: { fill: e.target.value } },
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
                    attrs: { body: { stroke: e.target.value } },
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
                  attrs: { body: { strokeWidth: Number(e.target.value) } },
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
    const label = (selectedEdge.getAttrByPath('labels/0/attrs/text/text') || '') as string
    const stroke = (selectedEdge.getAttrByPath('line/stroke') || '#a2b1c3') as string
    const strokeWidth = (selectedEdge.getAttrByPath('line/strokeWidth') || 2) as number

    return (
      <div className="property-panel">
        <div className="property-panel-header">
          <h3>连线属性</h3>
          <span className="node-type">edge</span>
        </div>

        <div className="property-section">
          <h4 className="section-title">基础信息</h4>
          <div className="property-item">
            <label>ID</label>
            <span className="property-value mono">{selectedEdge.id}</span>
          </div>
          <div className="property-item">
            <label>标签</label>
            <input
              type="text"
              value={label as string}
              onChange={(e) => {
                const labels = selectedEdge.getLabels()
                if (labels.length > 0) {
                  labels[0].attrs = {
                    text: { text: e.target.value },
                  }
                  selectedEdge.setLabels(labels)
                } else {
                  selectedEdge.setLabels([
                    { attrs: { text: { text: e.target.value } } },
                  ])
                }
              }}
              className="property-input"
            />
          </div>
        </div>

        <div className="property-section">
          <h4 className="section-title">连接关系</h4>
          <div className="property-item">
            <label>起点</label>
            <span className="property-value mono">
              {typeof selectedEdge.source === 'object'
                ? (selectedEdge.source as any).cell
                : '-'}
            </span>
          </div>
          <div className="property-item">
            <label>终点</label>
            <span className="property-value mono">
              {typeof selectedEdge.target === 'object'
                ? (selectedEdge.target as any).cell
                : '-'}
            </span>
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
