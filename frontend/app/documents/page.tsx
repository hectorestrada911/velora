'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Search, Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PDFManager from '../../components/PDFManager';
import FileUpload from '../../components/FileUpload';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'manager' | 'upload'>('manager');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Document Intelligence</h1>
          <p className="text-gray-400 text-lg">
            Upload, analyze, and manage your PDF documents with AI-powered insights
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
          <button
            onClick={() => setActiveTab('manager')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 ${
              activeTab === 'manager'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Documents</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDFs</span>
          </button>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'manager' ? (
            <PDFManager />
          ) : (
            <div className="max-w-4xl mx-auto">
              <FileUpload
                onContentAnalyzed={(content) => {
                  console.log('PDF analyzed:', content);
                  // You can add additional handling here
                }}
              />
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <div className="mt-12 bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('upload')}
              className="flex items-center space-x-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="text-white font-medium">Upload New PDF</div>
                <div className="text-gray-400 text-sm">Add a document for analysis</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('manager')}
              className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <Search className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <div className="text-white font-medium">Search Documents</div>
                <div className="text-gray-400 text-sm">Find specific information</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('manager')}
              className="flex items-center space-x-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
            >
              <FileText className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <div className="text-white font-medium">View All Documents</div>
                <div className="text-gray-400 text-sm">Browse your document library</div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Analysis</h3>
            <p className="text-gray-400 text-sm">
              AI automatically extracts key information, action items, and important dates from your PDFs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Intelligent Search</h3>
            <p className="text-gray-400 text-sm">
              Find any information across all your documents using natural language queries.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Memory Integration</h3>
            <p className="text-gray-400 text-sm">
              Important information is automatically saved to your Remember system for easy access.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
