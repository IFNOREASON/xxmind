import { ToolType } from './types'
import './Toolbar.css'

interface ToolbarProps {
  currentTool: ToolType
  onToolChange: (tool: ToolType) => void
  onUndo: () => void
  onRedo: () => void
  onDelete: () => void
  onAddEvent: () => void
  onResetTimeline: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitCenter: () => void
  canUndo: boolean
  canRedo: boolean
  hasSelection: boolean
}

export default function Toolbar({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  onDelete,
  onAddEvent,
  onResetTimeline,
  onZoomIn,
  onZoomOut,
  onFitCenter,
  canUndo,
  canRedo,
  hasSelection,
}: ToolbarProps) {
  const tools: { type: ToolType; icon: string; label: string }[] = [
    { type: 'select', icon: '🖱️', label: '选择' },
    { type: 'hand', icon: '✋', label: '平移' },
    { type: 'addEvent', icon: '➕', label: '添加事件' },
  ]

  return (
    <div className="timeline-toolbar">
      <div className="toolbar-section">
        <span className="toolbar-label">工具</span>
        <div className="toolbar-buttons">
          {tools.map((tool) => (
            <button
              key={tool.type}
              className={`toolbar-btn ${currentTool === tool.type ? 'active' : ''}`}
              onClick={() => onToolChange(tool.type)}
            >
              <span className="btn-icon">{tool.icon}</span>
              <span className="btn-text">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="toolbar-label">操作</span>
        <div className="toolbar-buttons">
          <button
            className="toolbar-btn"
            onClick={onAddEvent}
            title="添加新事件"
          >
            <span className="btn-icon">📅</span>
            <span className="btn-text">添加事件</span>
          </button>
          <button
            className="toolbar-btn danger"
            onClick={onDelete}
            disabled={!hasSelection}
            title="删除选中事件"
          >
            <span className="btn-icon">🗑️</span>
            <span className="btn-text">删除</span>
          </button>
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="toolbar-label">历史</span>
        <div className="toolbar-buttons">
          <button
            className="toolbar-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="撤销 (Ctrl+Z)"
          >
            <span className="btn-icon">↩️</span>
            <span className="btn-text">撤销</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="重做 (Ctrl+Y)"
          >
            <span className="btn-icon">↪️</span>
            <span className="btn-text">重做</span>
          </button>
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="toolbar-label">视图</span>
        <div className="toolbar-buttons">
          <button
            className="toolbar-btn"
            onClick={onZoomOut}
            title="缩小"
          >
            <span className="btn-icon">🔍-</span>
            <span className="btn-text">缩小</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={onZoomIn}
            title="放大"
          >
            <span className="btn-icon">🔍+</span>
            <span className="btn-text">放大</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={onFitCenter}
            title="适应画布"
          >
            <span className="btn-icon">🎯</span>
            <span className="btn-text">适应</span>
          </button>
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="toolbar-label">重置</span>
        <div className="toolbar-buttons">
          <button
            className="toolbar-btn danger"
            onClick={onResetTimeline}
            title="清空时间轴重新开始"
          >
            <span className="btn-icon">🔄</span>
            <span className="btn-text">重置</span>
          </button>
        </div>
      </div>
    </div>
  )
}
