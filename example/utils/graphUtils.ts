import { Graph } from '@antv/x6'
import { DiagramType } from '../types/editor'

interface MindMapNodeData {
  id: string
  label: string
  level: 'root' | 'primary' | 'secondary'
  children?: string[]
  [key: string]: any
}

function escapeMarkdown(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/#/g, '\\#')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/`/g, '\\`')
    .replace(/\n/g, ' ')
}

export const exportAsMarkdown = (graph: Graph, filename: string): void => {
  const nodes = graph.getNodes()

  const rootNode = nodes.find((n) => n.getData()?.level === 'root')
  if (!rootNode) return

  const nodeMap = new Map<string, { data: MindMapNodeData }>()
  nodes.forEach((n) => {
    const data = n.getData() as MindMapNodeData
    if (data) nodeMap.set(n.id, { data })
  })

  const rootData = rootNode.getData() as MindMapNodeData
  const mdFileName = (rootData.label || filename).trim() || filename

  const levelToHeading: Record<string, string> = {
    root: '#',
    primary: '##',
    secondary: '###',
  }

  const lines: string[] = []

  const walk = (nodeId: string) => {
    const entry = nodeMap.get(nodeId)
    if (!entry) return

    const { data } = entry
    const label = (data.label || '').trim()
    if (label) {
      const prefix = levelToHeading[data.level] || '###'
      lines.push(`${prefix} ${escapeMarkdown(label)}`)
      lines.push('')
    }

    if (data.children && data.children.length > 0) {
      for (const childId of data.children) {
        walk(childId)
      }
    }
  }

  walk(rootNode.id)

  const content = lines.join('\n')
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${mdFileName}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export interface GraphFileData {
  version: string
  diagramType: DiagramType
  title: string
  createdAt: string
  updatedAt: string
  nodes: any[]
  edges: any[]
  zoom: number
  pan: { x: number; y: number }
}

export const FILE_EXTENSION = '.g6x'
export const FILE_TYPE = 'application/json'

export const createFileData = (
  graph: Graph | null,
  diagramType: DiagramType,
  title: string
): GraphFileData => {
  const now = new Date().toISOString()

  const cells = graph?.toJSON().cells || []

  return {
    version: '1.0.0',
    diagramType,
    title,
    createdAt: now,
    updatedAt: now,
    nodes: cells.filter((c: any) => c.shape !== 'edge' && c.shape !== 'path') || [],
    edges: cells.filter((c: any) => c.shape === 'edge') || [],
    zoom: graph?.zoom() || 1,
    pan: { x: 0, y: 0 },
  }
}

export const loadFileData = (graph: Graph, data: GraphFileData) => {
  graph.clearCells()

  const allCells = [...data.nodes, ...data.edges]
  if (allCells.length > 0) {
    allCells.forEach(cell => graph.addCell(cell))
  }

  if (data.zoom) {
    graph.zoom(data.zoom)
  }

  if (data.pan) {
    graph.translate(data.pan.x, data.pan.y)
  }
}

export const downloadFile = (data: GraphFileData, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: FILE_TYPE })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith(FILE_EXTENSION)
    ? filename
    : `${filename}${FILE_EXTENSION}`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportAsSVG = async (graph: Graph, filename: string) => {
  try {
    let svgData = ''
    await graph.toSVG((svg: string) => {
      svgData = svg
    }, {
      backgroundColor: '#ffffff',
      padding: 20,
    } as any)

    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error('SVG export failed:', error)
    return false
  }
}

export const exportAsPNG = async (graph: Graph, filename: string) => {
  try {
    let svgData = ''
    await graph.toSVG((svg: string) => {
      svgData = svg
    }, {
      backgroundColor: '#ffffff',
      padding: 20,
    } as any)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    return new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = Math.max(img.width * 2, 100)
        canvas.height = Math.max(img.height * 2, 100)
        ctx!.scale(2, 2)
        ctx!.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)

        const pngUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = `${filename}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        resolve()
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Image load failed'))
      }
      img.src = url
    })
  } catch (error) {
    console.error('PNG export failed:', error)
    return Promise.reject(error)
  }
}

export const readFile = (file: File): Promise<GraphFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content) as GraphFileData

        if (!data.version || !data.diagramType) {
          reject(new Error('无效的文件格式'))
          return
        }

        resolve(data)
      } catch (error) {
        reject(new Error('文件解析失败'))
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsText(file)
  })
}

export const triggerFileInput = (accept: string): Promise<File> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.style.display = 'none'

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        resolve(files[0])
      } else {
        reject(new Error('未选择文件'))
      }
      document.body.removeChild(input)
    }

    input.oncancel = () => {
      reject(new Error('取消选择'))
      document.body.removeChild(input)
    }

    document.body.appendChild(input)
    input.click()
  })
}

export const zoomIn = (graph: Graph | null) => {
  if (!graph) return 1
  try {
    const currentZoom = graph.zoom()
    const newZoom = Math.min(currentZoom + 0.1, 3)
    graph.zoom(newZoom)
    return newZoom
  } catch (e) {
    console.error('zoomIn error:', e)
    return 1
  }
}

export const zoomOut = (graph: Graph | null) => {
  if (!graph) return 1
  try {
    const currentZoom = graph.zoom()
    const newZoom = Math.max(currentZoom - 0.1, 0.1)
    graph.zoom(newZoom)
    return newZoom
  } catch (e) {
    console.error('zoomOut error:', e)
    return 1
  }
}

export const zoomToFit = (graph: Graph | null) => {
  if (!graph) return
  try {
    graph.zoomToFit({ padding: 30 })
    graph.centerContent()
  } catch (e) {
    console.error('zoomToFit error:', e)
    try {
      const bbox = graph.getCellsBBox(graph.getCells())
      if (bbox) {
        const scale = Math.min(
          (graph.container.clientWidth - 60) / bbox.width,
          (graph.container.clientHeight - 60) / bbox.height,
          2
        )
        graph.zoom(Math.max(scale, 0.1))
        graph.centerContent()
      }
    } catch (e2) {
      console.error('fallback zoomToFit error:', e2)
    }
  }
}

export const zoomTo = (graph: Graph | null, scale: number) => {
  if (!graph) return
  try {
    graph.zoom(scale)
  } catch (e) {
    console.error('zoomTo error:', e)
  }
}

export const getZoomLevel = (graph: Graph | null): number => {
  if (!graph) return 1
  try {
    return graph.zoom() || 1
  } catch (e) {
    return 1
  }
}
