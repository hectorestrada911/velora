'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, File, X, Brain, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  onContentAnalyzed: (content: any) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  analysis?: any;
  status: 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error';
}

export default function FileUpload({ onContentAnalyzed }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    await processFiles(selectedFiles);
  }, []);

  const processFiles = async (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploading'
    }));

    setFiles(prev => [...prev, ...newFiles]);

    for (const file of fileList) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    try {
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.name === file.name ? { ...f, status: 'processing' } : f
      ));

      // Extract text content based on file type
      let content = '';
      
      if (file.type === 'application/pdf') {
        content = await extractPDFText(file);
      } else if (file.type.includes('text/') || file.type.includes('document')) {
        content = await extractTextFile(file);
      } else {
        throw new Error('Unsupported file type');
      }

      // Update with content
      setFiles(prev => prev.map(f => 
        f.name === file.name ? { ...f, content, status: 'analyzing' } : f
      ));

      // Analyze with AI
      const analysis = await analyzeWithAI(content);
      
      // Update with analysis
      setFiles(prev => prev.map(f => 
        f.name === file.name ? { ...f, analysis, status: 'completed' } : f
      ));

      // Notify parent component
      onContentAnalyzed({
        type: 'file',
        content,
        analysis,
        fileName: file.name
      });

      toast.success(`"${file.name}" analyzed successfully!`);
    } catch (error) {
      console.error('Error processing file:', error);
      setFiles(prev => prev.map(f => 
        f.name === file.name ? { ...f, status: 'error' } : f
      ));
      toast.error(`Failed to process "${file.name}"`);
    }
  };

  const extractPDFText = async (file: File): Promise<string> => {
    // For now, we'll simulate PDF text extraction
    // In production, you'd use pdf-parse or similar library
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate extracted text - replace with actual PDF parsing
        const mockText = `Document: ${file.name}
        
This is a simulated text extraction from the uploaded PDF. In the real implementation, this would contain the actual text content extracted from the PDF file.

The AI will analyze this content to extract:
- Tasks and reminders
- Important dates and deadlines
- People mentioned
- Projects and topics
- Priority levels
- Action items

This makes your documents searchable and actionable!`;
        resolve(mockText);
      };
      reader.readAsText(file);
    });
  };

  const extractTextFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(file);
    });
  };

  const analyzeWithAI = async (content: string) => {
    try {
      // Use environment variable for API URL, fallback to relative path
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/analyze';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to local analysis
      return analyzeLocally(content);
    }
  };

  const analyzeLocally = (content: string) => {
    // Fallback analysis using our smart analyzer
    const words = content.toLowerCase().split(' ');
    
    const hasUrgent = words.some(word => 
      ['urgent', 'asap', 'immediately', 'now', 'today'].includes(word)
    );
    
    const hasDeadline = words.some(word => 
      ['deadline', 'due', 'by', 'until', 'before'].includes(word)
    );

    return {
      type: 'document',
      priority: hasUrgent ? 'high' : hasDeadline ? 'medium' : 'low',
      confidence: 0.8,
      summary: content.substring(0, 100) + '...',
      tags: ['document', 'uploaded'],
      extractedData: {
        people: [],
        dates: [],
        actions: [],
        topics: []
      }
    };
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleFollowUpQuestion = (question: string) => {
    // TODO: Implement follow-up question handling
    console.log('Follow-up question:', question);
    toast.success(`Processing: ${question}`);
    
    // For now, just log the question
    // In the future, this could trigger additional AI processing
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Upload className="w-4 h-4 animate-pulse" />;
      case 'processing':
        return <FileText className="w-4 h-4 animate-spin" />;
      case 'analyzing':
        return <Brain className="w-4 h-4 animate-pulse text-blue-400" />;
      case 'completed':
        return <Sparkles className="w-4 h-4 text-green-400" />;
      case 'error':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-400';
      case 'processing':
        return 'text-yellow-400';
      case 'analyzing':
        return 'text-purple-400';
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Upload Area */}
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50/10 shadow-lg shadow-blue-500/20' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.txt,.doc,.docx,.md"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          </motion.div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">
              Upload Your Documents
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Drop PDFs, Word docs, or text files here. Our AI will read, understand, and organize everything for you.
            </p>
          </div>
          
          <div className="text-sm text-gray-500">
            Supports: PDF, Word, Text, Markdown
          </div>
        </div>
      </motion.div>

      {/* File List */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-3"
        >
          <h4 className="text-lg font-semibold text-white">
            Your Documents ({files.length})
          </h4>
          
          <div className="space-y-3">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${getStatusColor(file.status)}`}>
                      {getStatusIcon(file.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{file.name}</span>
                        <span className="text-sm text-gray-400">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 mt-1">
                        {file.status === 'uploading' && 'Uploading...'}
                        {file.status === 'processing' && 'Extracting text...'}
                        {file.status === 'analyzing' && 'AI is analyzing...'}
                        {file.status === 'completed' && 'Analysis complete!'}
                        {file.status === 'error' && 'Processing failed'}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Analysis Results */}
                {file.analysis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-gray-700"
                  >
                    {/* AI Response */}
                    {file.analysis.aiResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                      >
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Brain className="w-3 h-3 text-blue-400" />
                          </div>
                          <p className="text-blue-100 text-sm leading-relaxed">
                            {file.analysis.aiResponse}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <div className="text-white capitalize">{file.analysis.type}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Priority:</span>
                        <div className={`capitalize ${
                          file.analysis.priority === 'high' ? 'text-red-400' :
                          file.analysis.priority === 'medium' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {file.analysis.priority}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Confidence:</span>
                        <div className="text-white">
                          {(file.analysis.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {file.analysis.tags?.map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Follow-up Questions */}
                    {file.analysis.followUpQuestions && file.analysis.followUpQuestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 pt-4 border-t border-gray-700"
                      >
                        <h5 className="text-sm font-medium text-gray-300 mb-3">Would you like me to:</h5>
                        <div className="space-y-2">
                          {file.analysis.followUpQuestions.map((question: string, index: number) => (
                            <button
                              key={index}
                              onClick={() => handleFollowUpQuestion(question)}
                              className="w-full text-left p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700 hover:border-blue-500/30 transition-all duration-200 text-sm text-gray-200 hover:text-blue-100"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
