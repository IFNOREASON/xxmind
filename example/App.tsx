import { useState, useCallback, useRef, useEffect } from 'react'
import { Graph } from '@antv/x6'
import { ToolType, isDiagramTool, isConverterTool } from './types/editor'
import ToolSelector from './components/DiagramTypeSelector'
import EditorRenderer from './components/EditorRenderer'
import ExportMenu from './components/ExportMenu'
import {
  createFileData,
  loadFileData,
  downloadFile,
  exportAsSVG,
  exportAsPNG,
  readFile,
  triggerFileInput,
  FILE_EXTENSION,
  zoomIn,
  zoomOut,
  zoomToFit,
  getZoomLevel,
  GraphFileData,
} from './utils/graphUtils'
import './App.css'
import './styles/placeholder.css'

function App() {
  const [currentTool, setCurrentTool] = useState<ToolType>('flowchart')
  const [fileName, setFileName] = useState('未命名文档')
  const [isDirty, setIsDirty] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [status, setStatus] = useState('就绪')
  const [loadedData, setLoadedData] = useState<GraphFileData | null>(null)
  const graphRef = useRef<Graph | null>(null)

  const handleGraphReady = useCallback((graph: Graph, shapeManager?: any) => {
    console.log('Graph ready:', graph)
    graphRef.current = graph
    setIsDirty(true)
    setZoomLevel(Math.round(graph.zoom() * 100))

    graph.on('scale', () => {
      setZoomLevel(Math.round(graph.zoom() * 100))
    })
    graph.on('change:cells', () => {
      setIsDirty(true)
    })
  }, [])

  const getToolName = (type: ToolType): string => {
    const names: Record<ToolType, string> = {
      flowchart: '流程图',
      swimlane: '泳道图',
      fishbone: '鱼骨图',
      timeline: '时间轴',
      architecture: '架构图',
      mindmap: '思维导图',
      'word-to-pdf': 'Word转PDF',
    }
    return names[type] || '工具'
  }

  const handleTypeChange = useCallback((type: ToolType) => {
    if (isDirty && isDiagramTool(currentTool)) {
      const confirmed = window.confirm('当前画布有未保存的更改，切换工具会丢失更改。是否继续？')
      if (!confirmed) return
    }
    setCurrentTool(type)
    setIsDirty(false)
    setStatus(`已切换到${getToolName(type)}`)
  }, [isDirty, currentTool])

  const handleSave = useCallback(async () => {
    if (!isDiagramTool(currentTool)) return
    
    console.log('handleSave called, graphRef.current:', graphRef.current)
    if (!graphRef.current) {
      setStatus('错误：画布未就绪')
      return
    }

    try {
      const fileData = createFileData(graphRef.current, currentTool, fileName)
      console.log('fileData:', fileData)
      downloadFile(fileData, fileName)
      setIsDirty(false)
      setStatus('保存成功')
      setTimeout(() => setStatus('就绪'), 2000)
    } catch (error) {
      console.error('Save error:', error)
      setStatus('保存失败')
    }
  }, [currentTool, fileName])

  const handleOpen = useCallback(async () => {
    if (!isDiagramTool(currentTool)) return
    
    if (isDirty) {
      const confirmed = window.confirm('当前画布有未保存的更改，打开新文件会丢失更改。是否继续？')
      if (!confirmed) return
    }

    try {
      const file = await triggerFileInput(FILE_EXTENSION)
      const fileData = await readFile(file)
      console.log('Loaded file data:', fileData)

      setCurrentTool(fileData.diagramType as ToolType)
      setFileName(fileData.title || file.name.replace(FILE_EXTENSION, ''))
      setLoadedData(fileData)

      setTimeout(() => {
        setIsDirty(false)
        setStatus('打开成功')
        setTimeout(() => setStatus('就绪'), 2000)
      }, 300)
    } catch (error) {
      if ((error as Error).message !== '取消选择') {
        setStatus('打开失败：' + (error as Error).message)
      }
    }
  }, [isDirty, currentTool])

  const handleExportJSON = useCallback(() => {
    if (!isDiagramTool(currentTool)) return
    
    console.log('handleExportJSON called, graphRef.current:', graphRef.current)
    if (!graphRef.current) {
      setStatus('错误：画布未就绪')
      return
    }

    try {
      const fileData = createFileData(graphRef.current, currentTool, fileName)
      console.log('Exporting JSON:', fileData)
      downloadFile(fileData, fileName)
      setStatus('导出成功')
      setTimeout(() => setStatus('就绪'), 2000)
    } catch (error) {
      console.error('Export JSON error:', error)
      setStatus('导出失败')
    }
  }, [currentTool, fileName])

  const handleExportSVG = useCallback(async () => {
    if (!isDiagramTool(currentTool)) return
    
    console.log('handleExportSVG called, graphRef.current:', graphRef.current)
    if (!graphRef.current) {
      setStatus('错误：画布未就绪')
      return
    }

    try {
      await exportAsSVG(graphRef.current, fileName)
      setStatus('导出 SVG 成功')
      setTimeout(() => setStatus('就绪'), 2000)
    } catch (error) {
      console.error('Export SVG error:', error)
      setStatus('导出 SVG 失败')
    }
  }, [currentTool, fileName])

  const handleExportPNG = useCallback(async () => {
    if (!isDiagramTool(currentTool)) return
    
    console.log('handleExportPNG called, graphRef.current:', graphRef.current)
    if (!graphRef.current) {
      setStatus('错误：画布未就绪')
      return
    }

    try {
      await exportAsPNG(graphRef.current, fileName)
      setStatus('导出 PNG 成功')
      setTimeout(() => setStatus('就绪'), 2000)
    } catch (error) {
      console.error('Export PNG error:', error)
      setStatus('导出 PNG 失败')
    }
  }, [currentTool, fileName])

  const handleZoomIn = useCallback(() => {
    if (!isDiagramTool(currentTool)) return
    
    console.log('handleZoomIn called, graphRef.current:', graphRef.current)
    if (graphRef.current) {
      const newZoom = zoomIn(graphRef.current)
      setZoomLevel(Math.round(newZoom * 100))
      setStatus('放大')
      setTimeout(() => setStatus('就绪'), 1000)
    } else {
      setStatus('画布未就绪')
      setTimeout(() => setStatus('就绪'), 1000)
    }
  }, [currentTool])

  const handleZoomOut = useCallback(() => {
    if (!isDiagramTool(currentTool)) return
    
    console.log('handleZoomOut called, graphRef.current:', graphRef.current)
    if (graphRef.current) {
      const newZoom = zoomOut(graphRef.current)
      setZoomLevel(Math.round(newZoom * 100))
      setStatus('缩小')
      setTimeout(() => setStatus('就绪'), 1000)
    } else {
      setStatus('画布未就绪')
      setTimeout(() => setStatus('就绪'), 1000)
    }
  }, [currentTool])

  const handleZoomToFit = useCallback(() => {
    if (!isDiagramTool(currentTool)) return
    
    console.log('handleZoomToFit called, graphRef.current:', graphRef.current)
    if (graphRef.current) {
      zoomToFit(graphRef.current)
      setStatus('适应画布')
      setTimeout(() => setStatus('就绪'), 1000)
    } else {
      setStatus('画布未就绪')
      setTimeout(() => setStatus('就绪'), 1000)
    }
  }, [currentTool])

  const renderDiagramActions = () => (
    <>
      <button className="btn btn-sm" onClick={handleOpen}>
        <span>📁</span> 打开
      </button>
      <button className="btn btn-sm btn-primary" onClick={handleSave}>
        <span>💾</span> 保存
      </button>
      <ExportMenu
        onExportSVG={handleExportSVG}
        onExportPNG={handleExportPNG}
        onExportJSON={handleExportJSON}
      />
      <div className="action-divider" />
      <button className="btn btn-sm" onClick={handleZoomOut}>
        <span>🔍-</span> 缩小
      </button>
      <button className="btn btn-sm" onClick={handleZoomIn}>
        <span>🔍+</span> 放大
      </button>
      <button className="btn btn-sm" onClick={handleZoomToFit}>
        <span>🎯</span> 适应画布
      </button>
    </>
  )

  const renderConverterActions = () => (
    <>
      <span style={{ fontSize: '14px', color: '#666' }}>
        <span>📝</span> 文件转换工具
      </span>
    </>
  )

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <a href="/" className="btn btn-sm">
            <span>🏠</span> 返回主页
          </a>
          <div className="app-logo">
            <span className="logo-icon">🛠️</span>
            <span className="logo-text">通用工具集</span>
          </div>
          <ToolSelector
            currentType={currentTool}
            onTypeChange={handleTypeChange}
          />
          {isDiagramTool(currentTool) && (
            <div className="file-name">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="file-name-input"
              />
              {isDirty && <span className="dirty-indicator">*</span>}
            </div>
          )}
        </div>
        <div className="header-actions">
          {isDiagramTool(currentTool) ? renderDiagramActions() : renderConverterActions()}
        </div>
      </header>

      <main className="app-main">
        <EditorRenderer
          key={currentTool}
          diagramType={currentTool}
          onGraphReady={handleGraphReady}
          data={loadedData}
        />
      </main>

      <footer className="app-footer">
        <div className="footer-left">
          <span className="status-item">
            <span className="status-icon">{status === '就绪' ? '✅' : '⏳'}</span>
            {status}
          </span>
        </div>
        <div className="footer-right">
          {isDiagramTool(currentTool) && (
            <span className="status-item">{zoomLevel}%</span>
          )}
          <span className="status-item">{new Date().toLocaleDateString()}</span>
        </div>
      </footer>
    </div>
  )
}

export default App
