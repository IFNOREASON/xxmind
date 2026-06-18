import { useState } from 'react'
import { ToolType, ALL_TOOLS, DIAGRAM_TOOLS, CONVERTER_TOOLS, ToolConfig } from '../types/editor'
import './DiagramTypeSelector.css'

interface ToolSelectorProps {
  currentType: ToolType
  onTypeChange: (type: ToolType) => void
}

export default function ToolSelector({ currentType, onTypeChange }: ToolSelectorProps) {
  const [showMenu, setShowMenu] = useState(false)

  const currentConfig = ALL_TOOLS.find(t => t.type === currentType)!

  const categoryNames: Record<string, string> = {
    diagram: '图形编辑器',
    converter: '转换工具'
  }

  const renderToolGroup = (tools: ToolConfig[], category: string) => (
    <div className="tool-group" key={category}>
      <div className="tool-group-title">{categoryNames[category]}</div>
      {tools.map((config) => (
        <button
          key={config.type}
          className={`type-menu-item ${currentType === config.type ? 'active' : ''}`}
          onClick={() => {
            onTypeChange(config.type)
            setShowMenu(false)
          }}
        >
          <span className="item-icon">{config.icon}</span>
          <div className="item-content">
            <span className="item-name">{config.name}</span>
            <span className="item-description">{config.description}</span>
          </div>
        </button>
      ))}
    </div>
  )

  return (
    <div className="diagram-type-selector">
      <button
        className="type-selector-button"
        onClick={() => setShowMenu(!showMenu)}
      >
        <span className="type-icon">{currentConfig.icon}</span>
        <span className="type-name">{currentConfig.name}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      {showMenu && (
        <div className="type-menu">
          <div className="type-menu-header">
            <h3>选择工具</h3>
            <p>选择要使用的工具类型</p>
          </div>
          <div className="type-menu-items">
            {renderToolGroup(DIAGRAM_TOOLS, 'diagram')}
            {renderToolGroup(CONVERTER_TOOLS, 'converter')}
          </div>
        </div>
      )}
      {showMenu && (
        <div
          className="type-menu-overlay"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}
