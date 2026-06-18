import { Node } from '@antv/x6'
import { TimelineEventData, EVENT_COLORS } from './types'
import './PropertyPanel.css'

interface PropertyPanelProps {
  selectedNodes: Node[]
  onUpdateEvent: (node: Node, updates: Partial<TimelineEventData>) => void
}

export default function PropertyPanel({
  selectedNodes,
  onUpdateEvent,
}: PropertyPanelProps) {
  const selectedEventNode = selectedNodes.find((node) => {
    const data = node.getData() as TimelineEventData
    return data && data.type === 'event'
  })

  const eventData = selectedEventNode?.getData() as TimelineEventData | undefined

  if (!selectedEventNode || !eventData) {
    return (
      <div className="timeline-property-panel">
        <div className="panel-header">
          <h3>属性面板</h3>
        </div>
        <div className="panel-empty">
          <div className="empty-icon">📋</div>
          <p>选择一个事件节点以编辑属性</p>
          <div className="empty-tips">
            <p>💡 提示：</p>
            <ul>
              <li>点击工具栏的"添加事件"按钮</li>
              <li>或直接在时间轴上点击添加事件</li>
              <li>拖动事件节点可调整发生时间</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateEvent(selectedEventNode, { title: e.target.value })
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateEvent(selectedEventNode, { description: e.target.value })
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value) || 2023
    onUpdateEvent(selectedEventNode, { year })
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value) || 1
    onUpdateEvent(selectedEventNode, { month })
  }

  const handleColorChange = (color: string) => {
    onUpdateEvent(selectedEventNode, { color })
  }

  return (
    <div className="timeline-property-panel">
      <div className="panel-header">
        <h3>事件属性</h3>
        <div className="event-color-indicator" style={{ backgroundColor: eventData.color }} />
      </div>

      <div className="panel-content">
        <div className="property-group">
          <label className="property-label">事件标题</label>
          <input
            type="text"
            className="property-input"
            value={eventData.title}
            onChange={handleTitleChange}
            placeholder="输入事件标题"
            maxLength={50}
          />
        </div>

        <div className="property-group">
          <label className="property-label">发生时间</label>
          <div className="date-inputs">
            <input
              type="number"
              className="property-input year-input"
              value={eventData.year}
              onChange={handleYearChange}
              min={1900}
              max={2100}
            />
            <span className="date-separator">年</span>
            <select
              className="property-select month-input"
              value={eventData.month}
              onChange={handleMonthChange}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {month}月
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="property-group">
          <label className="property-label">事件描述</label>
          <textarea
            className="property-textarea"
            value={eventData.description}
            onChange={handleDescriptionChange}
            placeholder="输入事件详细描述..."
            maxLength={200}
            rows={4}
          />
          <div className="char-count">
            {eventData.description?.length || 0}/200
          </div>
        </div>

        <div className="property-group">
          <label className="property-label">标记颜色</label>
          <div className="color-picker">
            {EVENT_COLORS.map((color) => (
              <button
                key={color}
                className={`color-option ${eventData.color === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>
        </div>

        <div className="property-group info-group">
          <label className="property-label">快捷操作</label>
          <div className="quick-actions">
            <div className="action-item">
              <span className="action-key">Delete</span>
              <span className="action-desc">删除事件</span>
            </div>
            <div className="action-item">
              <span className="action-key">Drag</span>
              <span className="action-desc">拖动调整时间</span>
            </div>
            <div className="action-item">
              <span className="action-key">Ctrl+Z</span>
              <span className="action-desc">撤销操作</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
