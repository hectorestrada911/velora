'use client'

import MemoryView from '@/components/MemoryView'

export default function MemoryPage() {
  return <MemoryView onClose={() => window.history.back()} />
}
