import { ToolType, FishboneStyle } from './types'
import './Toolbar.css'

interface ToolbarProps {
  currentTool: ToolType
  currentStyle: FishboneStyle
  onToolChange: (tool: ToolType) => void
  onStyleChange: (style: FishboneStyle) => void
  onUndo: () => void
  onRedo: () => void
  onDelete: () => void
  onCopy: () => void
  onPaste: () => void
  onClearAll: () => void
  onResetDiagram: () => void
}

const styleOptions: { value: FishboneStyle; label: string; description: string }[] = [
  { value: 'classic', label: '经典样式', description: '传统斜线鱼骨' },
  { value: 'right-angle', label: '直角样式', description: '90度直角鱼骨' },
  { value: 'rounded', label: '圆角样式', description: '圆润曲线鱼骨' },
  { value: 'modern', label: '现代样式', description: '现代设计鱼骨' },
]

export default function Toolbar({
  currentTool,
  currentStyle,
  onToolChange,
  onStyleChange,
  onUndo,
  onRedo,
  onDelete,
  onCopy,
  onPaste,
  onClearAll,
  onResetDiagram,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <span className="section-label">工具</span>
        <button
          className={`toolbar-btn ${currentTool === 'select' ? 'active' : ''}`}
          onClick={() => onToolChange('select')}
          title="选择 (V)"
        >
          <span className="toolbar-icon">⬚</span>
          <span className="toolbar-label">选择</span>
        </button>
        <button
          className={`toolbar-btn ${currentTool === 'hand' ? 'active' : ''}`}
          onClick={() => onToolChange('hand')}
          title="抓手 (H)"
        >
          <span className="toolbar-icon">✋</span>
          <span className="toolbar-label">抓手</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="section-label">样式</span>
        <div className="style-selector">
          <select
            className="style-select"
            value={currentStyle}
            onChange={(e) => onStyleChange(e.target.value as FishboneStyle)}
            title="切换鱼骨图样式"
          >
            {styleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="section-label">操作</span>
        <button className="toolbar-btn" onClick={onUndo} title="撤销 (Ctrl+Z)">
          <span className="toolbar-icon">↩</span>
          <span className="toolbar-label">撤销</span>
        </button>
        <button className="toolbar-btn" onClick={onRedo} title="重做 (Ctrl+Y)">
          <span className="toolbar-icon">↪</span>
          <span className="toolbar-label">重做</span>
        </button>
        <button className="toolbar-btn" onClick={onCopy} title="复制 (Ctrl+C)">
          <span className="toolbar-icon">📋</span>
          <span className="toolbar-label">复制</span>
        </button>
        <button className="toolbar-btn" onClick={onPaste} title="粘贴 (Ctrl+V)">
          <span className="toolbar-icon">📎</span>
          <span className="toolbar-label">粘贴</span>
        </button>
        <button className="toolbar-btn" onClick={onDelete} title="删除 (Delete)">
          <span className="toolbar-icon">🗑</span>
          <span className="toolbar-label">删除</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="section-label">画布</span>
        <button className="toolbar-btn" onClick={onClearAll} title="清空所有节点">
          <span className="toolbar-icon">🧹</span>
          <span className="toolbar-label">清空</span>
        </button>
        <button className="toolbar-btn" onClick={onResetDiagram} title="重置为默认鱼骨图">
          <span className="toolbar-icon">🔄</span>
          <span className="toolbar-label">重置</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="section-label">提示</span>
        <div className="toolbar-hint">
          <span>💡 Tab键添加子节点</span>
        </div>
      </div>
    </div>
  )
}
