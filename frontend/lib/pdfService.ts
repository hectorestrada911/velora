import { memoryService, Memory } from './memoryService'

export interface PDFDocument {
  id: string
  fileName: string
  fileSize: number
  uploadDate: string
  summary: string
  documentType: string
  importance: 'high' | 'medium' | 'low'
  keyPoints: string[]
  extractedData: {
    people: string[]
    dates: string[]
    amounts: string[]
    deadlines: string[]
    topics: string[]
  }
  actionItems: Array<{
    task: string
    deadline?: string
    priority: 'high' | 'medium' | 'low'
  }>
  reminders: Array<{
    title: string
    dueDate?: string
    priority: 'high' | 'medium' | 'low'
    description: string
  }>
  calendarEvents: Array<{
    title: string
    startTime: string
    endTime: string
    description: string
  }>
  memorySuggestions: string[]
  aiResponse: string
  followUpQuestions: string[]
  content: string // Full extracted text
}

export interface PDFSearchResult {
  document: PDFDocument
  relevanceScore: number
  matchedTerms: string[]
}

class PDFService {
  private pdfs: PDFDocument[] = []
  private readonly STORAGE_KEY = 'velora_pdf_documents'

  constructor() {
    this.loadPDFs()
  }

  private loadPDFs(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (stored) {
          this.pdfs = JSON.parse(stored)
        }
      }
    } catch (error) {
      console.error('Failed to load PDFs:', error)
      this.pdfs = []
    }
  }

  private savePDFs(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.pdfs))
      }
    } catch (error) {
      console.error('Failed to save PDFs:', error)
    }
  }

  addPDF(pdfData: any, content: string): PDFDocument {
    const pdf: PDFDocument = {
      id: Date.now().toString(),
      fileName: pdfData.fileName || 'document.pdf',
      fileSize: pdfData.fileSize || 0,
      uploadDate: new Date().toISOString(),
      summary: pdfData.summary || '',
      documentType: pdfData.documentType || 'other',
      importance: pdfData.importance || 'medium',
      keyPoints: pdfData.keyPoints || [],
      extractedData: {
        people: pdfData.extractedData?.people || [],
        dates: pdfData.extractedData?.dates || [],
        amounts: pdfData.extractedData?.amounts || [],
        deadlines: pdfData.extractedData?.deadlines || [],
        topics: pdfData.extractedData?.topics || []
      },
      actionItems: pdfData.actionItems || [],
      reminders: pdfData.reminders || [],
      calendarEvents: pdfData.calendarEvents || [],
      memorySuggestions: pdfData.memorySuggestions || [],
      aiResponse: pdfData.aiResponse || '',
      followUpQuestions: pdfData.followUpQuestions || [],
      content: content
    }

    this.pdfs.push(pdf)
    this.savePDFs()

    // Auto-save memory suggestions to the Remember system
    this.saveMemorySuggestions(pdf.memorySuggestions)

    return pdf
  }

  private saveMemorySuggestions(suggestions: string[]): void {
    suggestions.forEach(suggestion => {
      // Parse the memory suggestion (e.g., "REMEMBER Client ABC prefers email")
      const rememberMatch = suggestion.match(/REMEMBER\s+(.+)/i)
      if (rememberMatch) {
        const content = rememberMatch[1].trim()
        if (content) {
          // Determine category based on content
          let category: Memory['category'] = 'personal'
          const lowerContent = content.toLowerCase()
          
          if (lowerContent.includes('prefer') || lowerContent.includes('like')) {
            category = 'preference'
          } else if (lowerContent.includes('client') || lowerContent.includes('company')) {
            category = 'relationship'
          } else if (lowerContent.includes('budget') || lowerContent.includes('cost')) {
            category = 'context'
          }

          memoryService.addMemory(content, category, 'medium')
        }
      }
    })
  }

  getAllPDFs(): PDFDocument[] {
    return [...this.pdfs]
  }

  getPDFById(id: string): PDFDocument | undefined {
    return this.pdfs.find(pdf => pdf.id === id)
  }

  searchPDFs(query: string, limit: number = 5): PDFSearchResult[] {
    const lowerQuery = query.toLowerCase()
    const results: PDFSearchResult[] = []

    for (const pdf of this.pdfs) {
      let relevanceScore = 0
      const matchedTerms: string[] = []

      // Check fileName match
      if (pdf.fileName.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 15
        matchedTerms.push('filename')
      }

      // Check summary match
      if (pdf.summary.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 12
        matchedTerms.push('summary')
      }

      // Check content match
      if (pdf.content.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 10
        matchedTerms.push('content')
      }

      // Check key points match
      for (const point of pdf.keyPoints) {
        if (point.toLowerCase().includes(lowerQuery)) {
          relevanceScore += 8
          matchedTerms.push('keypoints')
        }
      }

      // Check extracted data matches
      for (const person of pdf.extractedData.people) {
        if (person.toLowerCase().includes(lowerQuery)) {
          relevanceScore += 10
          matchedTerms.push('people')
        }
      }

      for (const topic of pdf.extractedData.topics) {
        if (topic.toLowerCase().includes(lowerQuery)) {
          relevanceScore += 8
          matchedTerms.push('topics')
        }
      }

      // Check document type match
      if (pdf.documentType.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 5
        matchedTerms.push('type')
      }

      // Boost importance
      if (pdf.importance === 'high') relevanceScore += 5
      if (pdf.importance === 'medium') relevanceScore += 2

      if (relevanceScore > 0) {
        results.push({
          document: pdf,
          relevanceScore,
          matchedTerms
        })
      }
    }

    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
  }

  getPDFsByType(documentType: string): PDFDocument[] {
    return this.pdfs.filter(pdf => pdf.documentType === documentType)
  }

  getPDFsByImportance(importance: 'high' | 'medium' | 'low'): PDFDocument[] {
    return this.pdfs.filter(pdf => pdf.importance === importance)
  }

  deletePDF(id: string): boolean {
    const index = this.pdfs.findIndex(pdf => pdf.id === id)
    if (index !== -1) {
      this.pdfs.splice(index, 1)
      this.savePDFs()
      return true
    }
    return false
  }

  // Get PDFs for AI context
  getContextualPDFs(query: string): PDFDocument[] {
    const results = this.searchPDFs(query, 3)
    return results.map(result => result.document)
  }

  // Get statistics
  getStats(): {
    totalPDFs: number
    byType: Record<string, number>
    byImportance: Record<string, number>
    totalActionItems: number
    totalReminders: number
  } {
    const byType: Record<string, number> = {}
    const byImportance: Record<string, number> = {}
    let totalActionItems = 0
    let totalReminders = 0

    for (const pdf of this.pdfs) {
      byType[pdf.documentType] = (byType[pdf.documentType] || 0) + 1
      byImportance[pdf.importance] = (byImportance[pdf.importance] || 0) + 1
      totalActionItems += pdf.actionItems.length
      totalReminders += pdf.reminders.length
    }

    return {
      totalPDFs: this.pdfs.length,
      byType,
      byImportance,
      totalActionItems,
      totalReminders
    }
  }

  // Export PDF data for backup
  exportPDFs(): string {
    return JSON.stringify(this.pdfs, null, 2)
  }

  // Import PDF data from backup
  importPDFs(jsonData: string): boolean {
    try {
      const importedPDFs = JSON.parse(jsonData)
      if (Array.isArray(importedPDFs)) {
        this.pdfs = [...this.pdfs, ...importedPDFs]
        this.savePDFs()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to import PDFs:', error)
      return false
    }
  }
}

// Singleton instance
export const pdfService = new PDFService()
