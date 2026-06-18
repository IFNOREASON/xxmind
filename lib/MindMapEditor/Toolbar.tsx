import { ToolType } from './types'
import './Toolbar.css'

interface ToolbarProps {
  currentTool: ToolType
  onToolChange: (tool: ToolType) => void
  onUndo: () => void
  onRedo: () => void
  onDelete: () => void
  onAddChild: () => void
  onAddSibling: () => void
  onResetDiagram: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitCenter: () => void
}

export default function Toolbar({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  onDelete,
  onAddChild,
  onAddSibling,
  onResetDiagram,
  onZoomIn,
  onZoomOut,
  onFitCenter,
}: ToolbarProps) {
  return (
    <div className="mindmap-toolbar">
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${currentTool === 'select' ? 'active' : ''}`}
          onClick={() => onToolChange('select')}
          title="选择 (V)"
        >
          <span className="icon">⬚</span>
          <span className="label">选择</span>
        </button>
        <button
          className={`toolbar-btn ${currentTool === 'hand' ? 'active' : ''}`}
          onClick={() => onToolChange('hand')}
          title="拖拽 (H)"
        >
          <span className="icon">✋</span>
          <span className="label">拖拽</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={onAddChild}
          title="添加子节点 (Tab)"
        >
          <span className="icon">➕</span>
          <span className="label">子节点</span>
        </button>
        <button
          className="toolbar-btn"
          onClick={onAddSibling}
          title="添加同级节点 (Enter)"
        >
          <span className="icon">⊞</span>
          <span className="label">同级</span>
        </button>
        <button
          className="toolbar-btn delete"
          onClick={onDelete}
          title="删除选中 (Delete)"
        >
          <span className="icon">🗑</span>
          <span className="label">删除</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={onUndo}
          title="撤销 (Ctrl+Z)"
        >
          <span className="icon">↩</span>
          <span className="label">撤销</span>
        </button>
        <button
          className="toolbar-btn"
          onClick={onRedo}
          title="重做 (Ctrl+Y)"
        >
          <span className="icon">↪</span>
          <span className="label">重做</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={onZoomIn}
          title="放大"
        >
          <span className="icon">🔍+</span>
          <span className="label">放大</span>
        </button>
        <button
          className="toolbar-btn"
          onClick={onZoomOut}
          title="缩小"
        >
          <span className="icon">🔍-</span>
          <span className="label">缩小</span>
        </button>
        <button
          className="toolbar-btn"
          onClick={onFitCenter}
          title="适应画布"
        >
          <span className="icon">🎯</span>
          <span className="label">适应</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="toolbar-btn reset"
          onClick={onResetDiagram}
          title="重置思维导图"
        >
          <span className="icon">🔄</span>
          <span className="label">重置</span>
        </button>
      </div>
    </div>
  )
}
