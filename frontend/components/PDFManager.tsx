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
  Archive,
  ChevronDown,
  Tag,
  Sparkles
} from 'lucide-react';
import { pdfService, PDFDocument } from '../lib/pdfService';
import { documentService, Document } from '../lib/documentService';
import { useAuth } from './providers/AuthProvider';
import { toast } from 'react-hot-toast';

interface PDFManagerProps {
  onPDFSelected?: (pdf: PDFDocument) => void;
}

const PDFManager = ({ onPDFSelected }: PDFManagerProps) => {
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

  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    limit: 5 * 1024 * 1024 * 1024, // 5GB in bytes
    percentage: 0
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
    const totalSize = docs.reduce((sum, doc) => sum + doc.size, 0);
    const percentage = (totalSize / storageUsage.limit) * 100;
    
    setStats({
      totalPDFs: docs.length,
      actionItems: 0, // TODO: Calculate from document analysis
      reminders: 0,   // TODO: Calculate from document analysis
      highPriority: 0 // TODO: Calculate from document analysis
    });

    setStorageUsage(prev => ({
      ...prev,
      used: totalSize,
      percentage: percentage
    }));
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

  const handleExportPDF = (doc: Document) => {
    const dataStr = JSON.stringify(doc, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.name.replace('.pdf', '')}_analysis.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Document analysis exported');
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateSummary = async (doc: Document) => {
    try {
      toast.loading('Generating summary...', { id: 'summary' });
      // TODO: Implement AI summary generation
      // For now, just show a placeholder
      setTimeout(() => {
        toast.success('Summary generated!', { id: 'summary' });
      }, 2000);
    } catch (error) {
      toast.error('Failed to generate summary', { id: 'summary' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] rounded-3xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-electric-500/5 via-transparent to-purple-500/5 rounded-3xl"></div>
      
      {/* Floating Background Elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8
          }}
          className="absolute w-2 h-2 bg-electric-400 rounded-full"
          style={{
            left: `${15 + (i * 15)}%`,
            top: `${25 + (i % 3) * 20}%`
          }}
        />
      ))}

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-electric-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            My Documents
          </motion.h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your intelligent document hub - upload, analyze, and organize with AI-powered insights
          </p>
        </motion.div>

        {/* Simplified Storage Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30 mb-6"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Storage</span>
            <span className="text-sm text-white">
              {formatFileSize(storageUsage.used)} / {formatFileSize(storageUsage.limit)}
            </span>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                storageUsage.percentage > 80 ? 'bg-red-500' :
                storageUsage.percentage > 60 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
            />
          </div>
        </motion.div>

        {/* Simplified Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stats.totalPDFs}</div>
            <div className="text-sm text-gray-400">Documents</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stats.actionItems}</div>
            <div className="text-sm text-gray-400">Action Items</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stats.reminders}</div>
            <div className="text-sm text-gray-400">Reminders</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stats.highPriority}</div>
            <div className="text-sm text-gray-400">High Priority</div>
          </div>
        </div>

        {/* Simplified Search and Filters */}
        <div className="bg-gray-900/30 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white text-sm focus:outline-none focus:border-gray-500"
              >
                <option value="all">All Types</option>
                <option value="contract">Contracts</option>
                <option value="report">Reports</option>
                <option value="invoice">Invoices</option>
                <option value="proposal">Proposals</option>
              </select>
              
              <select
                value={filterImportance}
                onChange={(e) => setFilterImportance(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white text-sm focus:outline-none focus:border-gray-500"
              >
                <option value="all">All Priority</option>
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
                  <div
                    key={doc.id}
                    className={`bg-gray-900/40 rounded-xl p-4 border cursor-pointer transition-all duration-300 ${
                      selectedDocument?.id === doc.id 
                        ? 'border-blue-500/60 bg-blue-500/10' 
                        : 'border-gray-700/30 hover:border-gray-600/50'
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
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Document Thumbnail */}
                        <div className="w-10 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center border border-gray-600/30 flex-shrink-0">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                          
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium mb-1 truncate">
                            {doc.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span>{doc.uploadedAt.toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{formatFileSize(doc.size)}</span>
                          </div>
                          {doc.summary && (
                            <p className="text-gray-500 text-xs mt-1 line-clamp-1">{doc.summary}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`px-2 py-1 rounded text-xs ${getImportanceColor('medium')}`}>
                          {doc.category || 'other'}
                        </span>
                        
                        {/* Simplified Actions */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(doc.downloadUrl, '_blank');
                            }}
                            className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(doc.id);
                            }}
                            className="text-gray-400 hover:text-red-400 transition-colors p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </AnimatePresence>

              {documents.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-20 h-20 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-600/50"
                  >
                    <Archive className="w-10 h-10 text-gray-400" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-gray-300 mb-3">No Documents Found</h3>
                  <p className="text-gray-400 text-lg max-w-md mx-auto">
                    {searchQuery ? 'Try adjusting your search terms or filters' : 'Upload your first document to get started with AI-powered analysis'}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Enhanced Document Details Panel */}
          <div className="lg:col-span-1">
            {selectedDocument ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-gray-900/90 to-gray-800/70 rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 backdrop-blur-sm sticky top-4 relative overflow-hidden"
              >
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-electric-500/5 via-transparent to-blue-500/5 rounded-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-electric-400 to-blue-400 bg-clip-text text-transparent">
                      Document Details
                    </h3>
                    <motion.button
                      onClick={() => handleExportPDF(selectedDocument)}
                      className="text-gray-400 hover:text-electric-400 transition-colors p-2 hover:bg-electric-500/10 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Download className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="space-y-6">
                    {/* Document Info */}
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                      <h4 className="text-sm font-semibold text-electric-400 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Document Information
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Name:</span>
                          <span className="text-white font-medium text-right max-w-[60%] truncate">{selectedDocument.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white">{selectedDocument.type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Size:</span>
                          <span className="text-white">{(selectedDocument.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Category:</span>
                          <span className="text-white">{selectedDocument.category || 'Uncategorized'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Uploaded:</span>
                          <span className="text-white">{new Date(selectedDocument.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    {selectedDocument.summary && (
                      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                        <h4 className="text-sm font-semibold text-electric-400 mb-3 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Summary
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{selectedDocument.summary}</p>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                        <h4 className="text-sm font-semibold text-electric-400 mb-3 flex items-center">
                          <Tag className="w-4 h-4 mr-2" />
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedDocument.tags.map((tag, index) => (
                            <motion.span
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900/90 to-gray-800/70 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-electric-500/5 via-transparent to-blue-500/5 rounded-2xl"></div>
                <div className="relative z-10">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-16 h-16 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-600/50"
                  >
                    <Eye className="w-8 h-8 text-gray-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-3">Select a Document</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                    Choose a document from the list to view its details and AI-powered analysis
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFManager;