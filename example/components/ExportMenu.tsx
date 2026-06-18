import { useState } from 'react'
import './ExportMenu.css'

interface ExportMenuProps {
  onExportSVG: () => void
  onExportPNG: () => void
  onExportJSON: () => void
}

export default function ExportMenu({
  onExportSVG,
  onExportPNG,
  onExportJSON,
}: ExportMenuProps) {
  const [showMenu, setShowMenu] = useState(false)

  const handleExport = (callback: () => void) => {
    callback()
    setShowMenu(false)
  }

  return (
    <div className="export-menu-container">
      <button
        className="btn btn-sm"
        onClick={() => {
          console.log('Export button clicked')
          setShowMenu(!showMenu)
        }}
      >
        <span>📤</span> 导出
      </button>
      {showMenu && (
        <>
          <div
            className="export-menu-overlay"
            onClick={() => setShowMenu(false)}
          />
          <div className="export-menu">
            <div className="export-menu-header">
              <span>导出格式</span>
            </div>
            <button
              className="export-menu-item"
              onClick={() => {
                console.log('Export JSON clicked')
                handleExport(onExportJSON)
              }}
            >
              <span className="export-icon">📄</span>
              <div className="export-item-content">
                <span className="export-item-name">G6X 工程文件</span>
                <span className="export-item-desc">保存为可编辑的工程文件</span>
              </div>
            </button>
            <button
              className="export-menu-item"
              onClick={() => {
                console.log('Export SVG clicked')
                handleExport(onExportSVG)
              }}
            >
              <span className="export-icon">🖼️</span>
              <div className="export-item-content">
                <span className="export-item-name">SVG 矢量图</span>
                <span className="export-item-desc">导出为可缩放的矢量图形</span>
              </div>
            </button>
            <button
              className="export-menu-item"
              onClick={() => {
                console.log('Export PNG clicked')
                handleExport(onExportPNG)
              }}
            >
              <span className="export-icon">🖼️</span>
              <div className="export-item-content">
                <span className="export-item-name">PNG 图片</span>
                <span className="export-item-desc">导出为高清位图图片</span>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
