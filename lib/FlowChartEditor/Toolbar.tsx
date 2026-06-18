import { ToolType } from './types'
import './Toolbar.css'

interface ToolbarProps {
  currentTool: ToolType
  onToolChange: (tool: ToolType) => void
  onUndo: () => void
  onRedo: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onDelete: () => void
  onCopy: () => void
  onPaste: () => void
}

const tools: { type: ToolType; label: string; icon: string; group: 'cursor' | 'shapes' | 'actions' }[] = [
  { type: 'select', label: '选择', icon: '⬚', group: 'cursor' },
  { type: 'hand', label: '抓手', icon: '✋', group: 'cursor' },
  { type: 'rect', label: '矩形', icon: '▭', group: 'shapes' },
  { type: 'rounded-rect', label: '圆角矩形', icon: '◽', group: 'shapes' },
  { type: 'circle', label: '圆形', icon: '⭕', group: 'shapes' },
  { type: 'ellipse', label: '椭圆', icon: '⬭', group: 'shapes' },
  { type: 'diamond', label: '菱形', icon: '◇', group: 'shapes' },
  { type: 'polygon', label: '多边形', icon: '⬠', group: 'shapes' },
  { type: 'edge', label: '连线', icon: '↔', group: 'shapes' },
]

const Divider = () => <div className="toolbar-divider" />

export default function Toolbar({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onDelete,
  onCopy,
  onPaste,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <span className="section-label">选择</span>
        {tools.filter((t) => t.group === 'cursor').map((tool) => (
          <button
            key={tool.type}
            className={`toolbar-btn ${currentTool === tool.type ? 'active' : ''}`}
            onClick={() => onToolChange(tool.type)}
            title={tool.label}
          >
            <span className="toolbar-icon">{tool.icon}</span>
            <span className="toolbar-label">{tool.label}</span>
          </button>
        ))}
      </div>

      <Divider />

      <div className="toolbar-section">
        <span className="section-label">图形</span>
        {tools.filter((t) => t.group === 'shapes').map((tool) => (
          <button
            key={tool.type}
            className={`toolbar-btn ${currentTool === tool.type ? 'active' : ''}`}
            onClick={() => onToolChange(tool.type)}
            title={tool.label}
          >
            <span className="toolbar-icon">{tool.icon}</span>
            <span className="toolbar-label">{tool.label}</span>
          </button>
        ))}
      </div>

      <Divider />

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

      <Divider />

      <div className="toolbar-section">
        <span className="section-label">视图</span>
        <button className="toolbar-btn" onClick={onZoomIn} title="放大 (Ctrl++)">
          <span className="toolbar-icon">➕</span>
          <span className="toolbar-label">放大</span>
        </button>
        <button className="toolbar-btn" onClick={onZoomOut} title="缩小 (Ctrl+-)">
          <span className="toolbar-icon">➖</span>
          <span className="toolbar-label">缩小</span>
        </button>
        <button className="toolbar-btn" onClick={onZoomReset} title="重置缩放">
          <span className="toolbar-icon">🔍</span>
          <span className="toolbar-label">重置</span>
        </button>
      </div>
    </div>
  )
}
