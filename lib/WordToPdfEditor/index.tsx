import { useState, useCallback, useRef, useEffect } from 'react'
import mammoth from 'mammoth'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { WordToPdfEditorProps, FileItem } from './types'
import './WordToPdfEditor.css'

export default function WordToPdfEditor({ onConvert, onConvertComplete }: WordToPdfEditorProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [previewMode, setPreviewMode] = useState<'html' | 'pdf'>('html')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const parseWordFile = async (file: File): Promise<{ html: string; text: string }> => {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.convertToHtml({ 
      arrayBuffer,
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Heading 5'] => h5:fresh",
        "p[style-name='Heading 6'] => h6:fresh",
        "r[style-name='Bold'] => strong",
        "r[style-name='Italic'] => em",
        "r[style-name='Underline'] => u",
        "p[style-name='List Paragraph'] => li:fresh",
      ]
    } as any)
    const textResult = await mammoth.extractRawText({ arrayBuffer })
    return {
      html: result.value,
      text: textResult.value
    }
  }

  const generatePdfFromHtml = async (htmlContent: string, fileName: string): Promise<Blob> => {
    const printContainer = document.createElement('div')
    printContainer.className = 'pdf-print-container'
    printContainer.innerHTML = `
      <div style="
        width: 210mm;
        min-height: 297mm;
        padding: 20mm;
        margin: 0 auto;
        background: white;
        font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #333;
      ">
        <div style="
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e0e0e0;
        ">
          <h1 style="
            margin: 0 0 10px 0;
            color: #1a1a1a;
            font-size: 20px;
            font-weight: bold;
          ">${fileName.replace(/\.(docx|doc)$/i, '')}</h1>
        </div>
        <div style="word-wrap: break-word;">
          ${htmlContent}
        </div>
      </div>
    `
    document.body.appendChild(printContainer)

    try {
      const canvas = await html2canvas(printContainer, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 15000,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST')
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST')
        heightLeft -= pageHeight
      }

      return pdf.output('blob')
    } finally {
      document.body.removeChild(printContainer)
    }
  }

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return

    const wordFiles = Array.from(fileList).filter(file => 
      file.name.endsWith('.docx') || file.name.endsWith('.doc')
    )

    for (const file of wordFiles) {
      const newFile: FileItem = {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0
      }

      setFiles(prev => [...prev, newFile])
      
      try {
        setIsParsing(true)
        const { html, text } = await parseWordFile(file)
        setFiles(prev => prev.map(f => 
          f.id === newFile.id ? { ...f, htmlContent: html, textContent: text } : f
        ))
      } catch (error) {
        console.error('解析失败:', error)
      } finally {
        setIsParsing(false)
      }
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    e.target.value = ''
  }, [handleFiles])

  const convertFile = useCallback(async (fileItem: FileItem) => {
    setFiles(prev => prev.map(f => 
      f.id === fileItem.id ? { ...f, status: 'converting', progress: 0 } : f
    ))

    try {
      for (let i = 0; i <= 60; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress: i } : f
        ))
      }

      const pdfBlob = await generatePdfFromHtml(
        fileItem.htmlContent || '', 
        fileItem.name
      )

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'success', progress: 100, pdfBlob } : f
      ))

      onConvertComplete?.({ file: fileItem.file, success: true, pdfBlob })
    } catch (error) {
      console.error('转换失败:', error)
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'error', error: '转换失败' } : f
      ))
    }
  }, [onConvertComplete])

  const convertAll = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    for (const file of pendingFiles) {
      await convertFile(file)
    }
  }, [files, convertFile])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    if (selectedFileId === id) {
      setSelectedFileId(null)
      setPdfUrl(null)
    }
  }, [selectedFileId])

  const downloadPdf = useCallback((fileItem: FileItem) => {
    if (!fileItem.pdfBlob) {
      alert('请先完成转换后再下载')
      return
    }

    const fileName = fileItem.name.replace(/\.(docx|doc)$/i, '.pdf')
    const url = URL.createObjectURL(fileItem.pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const previewPdf = useCallback((fileItem: FileItem) => {
    if (!fileItem.pdfBlob) {
      alert('请先完成转换后再预览PDF')
      return
    }

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
    }
    
    const newPdfUrl = URL.createObjectURL(fileItem.pdfBlob)
    setPdfUrl(newPdfUrl)
    setPreviewMode('pdf')
  }, [pdfUrl])

  const switchToHtmlPreview = useCallback(() => {
    setPreviewMode('html')
  }, [])

  const selectedFile = files.find(f => f.id === selectedFileId)
  const pendingCount = files.filter(f => f.status === 'pending').length
  const successCount = files.filter(f => f.status === 'success').length

  useEffect(() => {
    if (selectedFile && selectedFile.pdfBlob && previewMode === 'pdf') {
      const newUrl = URL.createObjectURL(selectedFile.pdfBlob)
      setPdfUrl(newUrl)
    }
  }, [selectedFileId])

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [])

  return (
    <div className="word-to-pdf-editor">
      <div className="editor-toolbar">
        <button className="btn btn-primary" onClick={handleClick}>
          <span>📁</span> 添加文件
        </button>
        <button 
          className="btn btn-success" 
          onClick={convertAll}
          disabled={pendingCount === 0}
        >
          <span>🔄</span> 全部转换
        </button>
        {isParsing && (
          <span className="status-text parsing">
            <span>⏳</span> 正在解析文件...
          </span>
        )}
        {files.length > 0 && (
          <span className="status-text">
            共 {files.length} 个文件，已完成 {successCount} 个
          </span>
        )}
      </div>

      <div className="editor-content">
        <div className="file-panel">
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />

          {files.length === 0 && (
            <div
              className={`drop-zone ${isDragging ? 'dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
            >
              <div className="drop-icon">📄</div>
              <h3>拖拽Word文件到此处</h3>
              <p>或点击选择文件</p>
              <div className="file-formats">支持格式: .docx, .doc</div>
            </div>
          )}

          {files.length > 0 && (
            <div className="file-list">
              {files.map(file => (
                <div 
                  key={file.id} 
                  className={`file-item ${selectedFileId === file.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedFileId(file.id)
                    if (file.pdfBlob) {
                      setPreviewMode('html')
                    }
                  }}
                >
                  <span className="file-icon">📄</span>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatFileSize(file.size)}</div>
                    {file.status === 'converting' && (
                      <div className="conversion-progress">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    <div className="file-status-text">
                      {file.status === 'pending' && file.htmlContent && <span className="status-parsed">✓ 已解析</span>}
                      {file.status === 'pending' && !file.htmlContent && <span className="status-waiting">等待解析...</span>}
                      {file.status === 'converting' && <span className="status-converting">转换中 {file.progress}%</span>}
                      {file.status === 'success' && <span className="status-success">✓ 转换完成</span>}
                      {file.status === 'error' && <span className="status-error">✕ {file.error}</span>}
                    </div>
                  </div>
                  <div className="file-actions" onClick={e => e.stopPropagation()}>
                    {file.status === 'pending' && file.htmlContent && (
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => convertFile(file)}
                      >
                        转换
                      </button>
                    )}
                    {file.status === 'success' && (
                      <>
                        <button 
                          className="btn btn-sm"
                          onClick={() => previewPdf(file)}
                          style={{ background: '#1890ff', color: 'white' }}
                        >
                          预览PDF
                        </button>
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => downloadPdf(file)}
                        >
                          下载
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => removeFile(file.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {files.length === 0 && (
            <div className="conversion-tips">
              <h4>💡 使用提示</h4>
              <ul>
                <li>支持批量转换多个Word文档</li>
                <li>转换后的PDF将保留原始文档样式</li>
                <li>所有转换均在本地完成，文件不会上传到服务器</li>
                <li>支持 .docx 和 .doc 格式</li>
                <li>点击文件列表可预览文档内容</li>
              </ul>
            </div>
          )}
        </div>

        <div className="preview-panel">
          <div className="preview-header">
            <div className="preview-tabs">
              <button 
                className={`preview-tab ${previewMode === 'html' ? 'active' : ''}`}
                onClick={switchToHtmlPreview}
                disabled={!selectedFile}
              >
                文档预览
              </button>
              <button 
                className={`preview-tab ${previewMode === 'pdf' ? 'active' : ''}`}
                onClick={() => selectedFile && previewPdf(selectedFile)}
                disabled={!selectedFile || !selectedFile.pdfBlob}
              >
                PDF预览
              </button>
            </div>
            <div className="preview-actions">
              {selectedFile && previewMode === 'pdf' && selectedFile.pdfBlob && (
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => downloadPdf(selectedFile)}
                >
                  <span>⬇️</span> 下载PDF
                </button>
              )}
              {selectedFile && (
                <span className="preview-filename">{selectedFile.name}</span>
              )}
            </div>
          </div>
          <div className="preview-content" ref={previewRef}>
            {!selectedFile && (
              <div className="preview-placeholder">
                <div className="placeholder-icon">👁️</div>
                <p>点击左侧文件列表预览内容</p>
              </div>
            )}
            {selectedFile && !selectedFile.htmlContent && (
              <div className="preview-placeholder">
                <div className="placeholder-icon">⏳</div>
                <p>正在解析文件内容...</p>
              </div>
            )}
            {selectedFile && selectedFile.htmlContent && previewMode === 'html' && (
              <div 
                className="document-preview"
                dangerouslySetInnerHTML={{ __html: selectedFile.htmlContent }}
              />
            )}
            {selectedFile && previewMode === 'pdf' && pdfUrl && (
              <div className="pdf-preview-container">
                <iframe
                  src={pdfUrl}
                  className="pdf-preview-iframe"
                  title="PDF Preview"
                />
              </div>
            )}
            {selectedFile && previewMode === 'pdf' && !selectedFile.pdfBlob && (
              <div className="preview-placeholder">
                <div className="placeholder-icon">📋</div>
                <p>请先完成转换后再查看PDF预览</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}