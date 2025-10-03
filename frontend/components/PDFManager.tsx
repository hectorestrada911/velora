'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  Archive
} from 'lucide-react';
import { pdfService, PDFDocument } from '../lib/pdfService';
import { documentService, Document } from '../lib/documentService';
import { useAuth } from './providers/AuthProvider';
import { toast } from 'react-hot-toast';

interface PDFManagerProps {
  onPDFSelected?: (pdf: PDFDocument) => void;
}

export default function PDFManager({ onPDFSelected }: PDFManagerProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterImportance, setFilterImportance] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [stats, setStats] = useState({
    totalPDFs: 0,
    actionItems: 0,
    reminders: 0,
    highPriority: 0
  });

  useEffect(() => {
    if (user) {
      documentService.setUserId(user.uid);
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    try {
      const docs = await documentService.getDocuments();
      setDocuments(docs);
      updateStats(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const updateStats = (docs: Document[]) => {
    setStats({
      totalPDFs: docs.length,
      actionItems: 0, // TODO: Calculate from document analysis
      reminders: 0,   // TODO: Calculate from document analysis
      highPriority: 0 // TODO: Calculate from document analysis
    });
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await documentService.deleteDocument(documentId);
      await loadDocuments();
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await documentService.searchDocuments(query);
        setDocuments(results);
      } catch (error) {
        console.error('Error searching documents:', error);
        toast.error('Failed to search documents');
      }
    } else {
      await loadDocuments();
    }
  };

  const handleFilter = () => {
    let filtered = documents;

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.category === filterType);
    }

    if (filterImportance !== 'all') {
      // TODO: Add importance field to Document interface
      // filtered = filtered.filter(doc => doc.importance === filterImportance);
    }

    setDocuments(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [filterType, filterImportance]);


  const handleExportPDF = (pdf: PDFDocument) => {
    const dataStr = JSON.stringify(pdf, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pdf.fileName.replace('.pdf', '')}_analysis.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('PDF analysis exported');
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="w-4 h-4" />;
      case 'report': return <BookOpen className="w-4 h-4" />;
      case 'invoice': return <DollarSign className="w-4 h-4" />;
      case 'proposal': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">PDF Documents</h1>
        <p className="text-gray-400">
          Manage and search your uploaded PDF documents with AI-powered analysis
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Total PDFs</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.totalPDFs}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">Action Items</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.totalActionItems}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-400 text-sm">Reminders</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.totalReminders}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-gray-400 text-sm">High Priority</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.byImportance.high || 0}</div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search PDFs by name, content, or topics..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="md:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="contract">Contracts</option>
              <option value="report">Reports</option>
              <option value="invoice">Invoices</option>
              <option value="proposal">Proposals</option>
              <option value="manual">Manuals</option>
              <option value="academic">Academic</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Importance Filter */}
          <div className="md:w-48">
            <select
              value={filterImportance}
              onChange={(e) => setFilterImportance(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Importance</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* PDF List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Cards */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <AnimatePresence>
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-800/50 rounded-lg p-4 border border-gray-700 cursor-pointer transition-all duration-200 ${
                    selectedDocument?.id === doc.id ? 'border-blue-500 bg-blue-500/10' : 'hover:border-gray-600'
                  }`}
                  onClick={() => {
                    setSelectedDocument(doc);
                    // Convert Document to PDFDocument for compatibility
                    const pdfDoc: PDFDocument = {
                      id: doc.id,
                      fileName: doc.name,
                      fileSize: doc.size,
                      uploadDate: doc.uploadedAt.toISOString(),
                      summary: doc.summary || '',
                      documentType: doc.category || 'other',
                      importance: 'medium',
                      keyPoints: [],
                      extractedData: { people: [], dates: [], amounts: [], deadlines: [], topics: [] },
                      actionItems: [],
                      reminders: [],
                      calendarEvents: [],
                      memorySuggestions: [],
                      aiResponse: '',
                      followUpQuestions: [],
                      content: doc.content || ''
                    };
                    onPDFSelected?.(pdfDoc);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-700 rounded-lg">
                        {getTypeIcon(doc.category || 'other')}
                      </div>
                      <div>
                        <h3 className="text-white font-medium truncate max-w-xs">
                          {doc.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {doc.uploadedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceColor('medium')}`}>
                        {doc.category || 'other'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc.id);
                        }}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {pdf.summary}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-4">
                      {pdf.extractedData.people.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{pdf.extractedData.people.length}</span>
                        </div>
                      )}
                      {pdf.extractedData.deadlines.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{pdf.extractedData.deadlines.length}</span>
                        </div>
                      )}
                      {pdf.actionItems.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>{pdf.actionItems.length}</span>
                        </div>
                      )}
                    </div>
                    <span>{(pdf.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {pdfs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Archive className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">No PDFs found</h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Try adjusting your search terms' : 'Upload your first PDF to get started'}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* PDF Details */}
        <div className="lg:col-span-1">
          {selectedPDF ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 sticky top-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">PDF Details</h3>
                <button
                  onClick={() => handleExportPDF(selectedPDF)}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Key Points */}
                {selectedPDF.keyPoints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Key Points</h4>
                    <ul className="space-y-1">
                      {selectedPDF.keyPoints.map((point, index) => (
                        <li key={index} className="text-gray-400 text-sm flex items-start">
                          <span className="text-blue-400 mr-2 mt-1">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items */}
                {selectedPDF.actionItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Action Items</h4>
                    <div className="space-y-2">
                      {selectedPDF.actionItems.map((item, index) => (
                        <div key={index} className="p-2 bg-gray-700/50 rounded border border-gray-600">
                          <div className="text-white text-sm">{item.task}</div>
                          {item.deadline && (
                            <div className="text-gray-400 text-xs mt-1">
                              Due: {new Date(item.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* People Mentioned */}
                {selectedPDF.extractedData.people.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">People Mentioned</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPDF.extractedData.people.map((person, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                        >
                          {person}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topics */}
                {selectedPDF.extractedData.topics.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Topics</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPDF.extractedData.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 text-center">
              <Eye className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Select a PDF</h3>
              <p className="text-gray-500 text-sm">
                Click on a PDF document to view its details and analysis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
