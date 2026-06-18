import { Node, Edge } from '@antv/x6'
import { MindMapNodeData } from './types'
import { NODE_COLORS } from './MindMapShapeManager'
import './PropertyPanel.css'

interface PropertyPanelProps {
  selectedNodes: Node[]
  selectedEdges: Edge[]
  onUpdateNode: (node: Node, updates: { fillColor?: string; fontColor?: string; label?: string }) => void
}

const FONT_COLORS = [
  '#ffffff',
  '#000000',
  '#333333',
  '#666666',
  '#ff4d4f',
  '#52c41a',
  '#1890ff',
  '#722ed1',
]

export default function PropertyPanel({
  selectedNodes,
  selectedEdges,
  onUpdateNode,
}: PropertyPanelProps) {
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null
  const nodeData = selectedNode ? (selectedNode.getData() as MindMapNodeData) : null

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'root':
        return '中心主题'
      case 'primary':
        return '一级主题'
      case 'secondary':
        return '二级主题'
      default:
        return '未知'
    }
  }

  return (
    <div className="mindmap-property-panel">
      <div className="panel-header">
        <span className="panel-title">属性</span>
      </div>

      <div className="panel-content">
        {selectedNode && nodeData ? (
          <div className="property-group">
            <div className="property-item">
              <label className="property-label">节点类型</label>
              <div className="property-value">{getLevelLabel(nodeData.level)}</div>
            </div>

            <div className="property-item">
              <label className="property-label">节点文字</label>
              <input
                type="text"
                className="property-input"
                value={nodeData.label || ''}
                onChange={(e) => {
                  onUpdateNode(selectedNode, { label: e.target.value })
                }}
              />
            </div>

            <div className="property-item">
              <label className="property-label">背景颜色</label>
              <div className="color-picker">
                {NODE_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`color-swatch ${nodeData.fillColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onUpdateNode(selectedNode, { fillColor: color })
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="property-item">
              <label className="property-label">文字颜色</label>
              <div className="color-picker">
                {FONT_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`color-swatch ${nodeData.fontColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onUpdateNode(selectedNode, { fontColor: color })
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : selectedNodes.length > 1 ? (
          <div className="placeholder-text">
            已选择 {selectedNodes.length} 个节点
          </div>
        ) : selectedEdges.length > 0 ? (
          <div className="placeholder-text">
            已选择连接线
          </div>
        ) : (
          <div className="placeholder-text">
            选择一个节点查看属性
          </div>
        )}
      </div>

      <div className="panel-footer">
        <div className="shortcut-title">快捷键</div>
        <div className="shortcut-list">
          <div className="shortcut-item"><kbd>Tab</kbd> 添加子节点</div>
          <div className="shortcut-item"><kbd>Enter</kbd> 添加同级</div>
          <div className="shortcut-item"><kbd>Delete</kbd> 删除</div>
          <div className="shortcut-item"><kbd>Ctrl+Z</kbd> 撤销</div>
          <div className="shortcut-item"><kbd>Ctrl+Y</kbd> 重做</div>
          <div className="shortcut-item"><kbd>Ctrl+C</kbd> 复制</div>
          <div className="shortcut-item"><kbd>Ctrl+V</kbd> 粘贴</div>
          <div className="shortcut-item"><kbd>双击</kbd> 编辑文字</div>
        </div>
      </div>
    </div>
  )
}
