import { Node, Edge, Graph } from '@antv/x6'
import './PropertyPanel.css'

interface PropertyPanelProps {
  graph: Graph | null
  selectedNodes: Node[]
  selectedEdges: Edge[]
  selectedLanes: string[]
  onDeleteLane: (laneId: string) => void
  onClearLane: (laneId: string) => void
}

export default function PropertyPanel({
  graph,
  selectedNodes,
  selectedEdges,
  selectedLanes,
  onDeleteLane,
  onClearLane,
}: PropertyPanelProps) {
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null
  const selectedEdge = selectedEdges.length === 1 ? selectedEdges[0] : null
  const selectedLane = selectedLanes.length === 1 ? selectedLanes[0] : null

  const isSwimLane = selectedNode?.getData()?.type === 'swimlane'

  if (selectedLane && selectedNode && isSwimLane) {
    const laneName = (selectedNode.getAttrByPath('label/text') || '') as string
    const laneColor = (selectedNode.getAttrByPath('body/fill') || '') as string

    return (
      <div className="property-panel">
        <div className="property-panel-header">
          <h3>泳道属性</h3>
          <span className="node-type">swimlane</span>
        </div>

        <div className="property-section">
          <h4 className="section-title">基础信息</h4>
          <div className="property-item">
            <label>ID</label>
            <span className="property-value mono">{selectedLane}</span>
          </div>
          <div className="property-item">
            <label>名称</label>
            <input
              type="text"
              value={laneName}
              onChange={(e) => {
                selectedNode.attr('label/text', e.target.value)
              }}
              className="property-input"
            />
          </div>
          <div className="property-item">
            <label>颜色</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={laneColor}
                onChange={(e) => {
                  selectedNode.attr('body/fill', e.target.value)
                }}
                className="color-input"
              />
              <span className="color-value">{laneColor}</span>
            </div>
          </div>
        </div>

        <div className="property-section">
          <h4 className="section-title">操作</h4>
          <div className="button-group">
            <button
              className="btn btn-secondary btn-full"
              onClick={() => onClearLane(selectedLane)}
            >
              🧹 清空泳道内容
            </button>
            <button
              className="btn btn-danger btn-full"
              onClick={() => onDeleteLane(selectedLane)}
            >
              🗑️ 删除泳道
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedNode && !isSwimLane) {
    const nodeData = selectedNode.getData()
    const label = (selectedNode.getAttrByPath('label/text') || '') as string
    const description = (nodeData?.description || '') as string
    const fill = (selectedNode.getAttrByPath('body/fill') || '#ffffff') as string
    const stroke = (selectedNode.getAttrByPath('body/stroke') || '#1890ff') as string
    const strokeWidth = (selectedNode.getAttrByPath('body/strokeWidth') || 2) as number
    const x = selectedNode.position().x
    const y = selectedNode.position().y
    const width = selectedNode.size().width
    const height = selectedNode.size().height
    const shape = selectedNode.shape
    const nodeType = nodeData?.type || shape

    const typeLabels: Record<string, string> = {
      start: '开始节点',
      process: '处理节点',
      decision: '判断节点',
      end: '结束节点',
      rect: '矩形节点',
      polygon: '多边形节点',
    }

    return (
      <div className="property-panel">
        <div className="property-panel-header">
          <h3>节点属性</h3>
          <span className="node-type">{typeLabels[nodeType] || nodeType}</span>
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
              value={label}
              onChange={(e) => {
                selectedNode.attr('label/text', e.target.value)
              }}
              className="property-input"
            />
          </div>
          <div className="property-item">
            <label>业务描述</label>
            <textarea
              value={description}
              onChange={(e) => {
                selectedNode.setData({ ...nodeData, description: e.target.value })
              }}
              className="property-textarea"
              placeholder="输入业务描述..."
              rows={4}
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
                  selectedNode.position(Number(e.target.value), y)
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
                  selectedNode.position(x, Number(e.target.value))
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
                  selectedNode.resize(Number(e.target.value), height)
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
                  selectedNode.resize(width, Number(e.target.value))
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
                value={fill}
                onChange={(e) => {
                  selectedNode.attr('body/fill', e.target.value)
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
                value={stroke}
                onChange={(e) => {
                  selectedNode.attr('body/stroke', e.target.value)
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
              value={strokeWidth}
              onChange={(e) => {
                selectedNode.attr('body/strokeWidth', Number(e.target.value))
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
    const stroke = (selectedEdge.getAttrByPath('line/stroke') || '#666') as string
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
              value={label}
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
                value={stroke}
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
              value={strokeWidth}
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

  return (
    <div className="property-panel">
      <div className="property-panel-empty">
        <div className="empty-icon">📐</div>
        <p>选择一个泳道、节点或连线</p>
        <p className="empty-hint">查看和编辑属性</p>
      </div>
    </div>
  )
}
