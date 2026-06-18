export interface WordToPdfEditorProps {
  onConvert?: (file: File) => void
  onConvertComplete?: (result: any) => void
}

export interface FileItem {
  id: string
  file: File
  name: string
  size: number
  status: 'pending' | 'converting' | 'success' | 'error'
  progress: number
  htmlContent?: string
  textContent?: string
  pdfBlob?: Blob
  error?: string
}