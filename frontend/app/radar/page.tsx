'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Radar, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Plus,
  Mail,
  Sparkles,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { radarService } from '@/lib/radarService'
import { Followup, FollowDirection, RadarStats } from '@/types/radar'
import FollowupCard from '@/components/FollowupCard'
import { toast } from 'react-hot-toast'

type TimeframeTab = 'overdue' | 'today' | 'upcoming'
type DirectionTab = 'all' | 'YOU_OWE' | 'THEY_OWE'

export default function RadarPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [followups, setFollowups] = useState<Followup[]>([])
  const [stats, setStats] = useState<RadarStats>({
    overdueCount: 0,
    todayCount: 0,
    upcomingCount: 0,
    youOweCount: 0,
    theyOweCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [timeframeTab, setTimeframeTab] = useState<TimeframeTab>('today')
  const [directionTab, setDirectionTab] = useState<DirectionTab>('all')
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Load followups and stats
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, timeframeTab, directionTab])

  const loadData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Load stats
      const statsData = await radarService.getRadarStats(user.uid)
      setStats(statsData)

      // Load followups with filters
      const filter: any = { timeframe: timeframeTab }
      if (directionTab !== 'all') {
        filter.direction = directionTab as FollowDirection
      }

      const followupsData = await radarService.getFollowups(user.uid, filter)
      setFollowups(followupsData)

      // Show onboarding if no followups
      if (followupsData.length === 0 && statsData.youOweCount === 0 && statsData.theyOweCount === 0) {
        setShowOnboarding(true)
      }
    } catch (error) {
      console.error('Error loading radar data:', error)
      toast.error('Failed to load follow-ups')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDone = async (id: string) => {
    try {
      await radarService.markDone(id)
      toast.success('Marked as done')
      loadData()
    } catch (error) {
      toast.error('Failed to mark as done')
    }
  }

  const handleSnooze = async (id: string, until: number) => {
    try {
      await radarService.snoozeFollowup(id, until)
      loadData()
    } catch (error) {
      toast.error('Failed to snooze')
    }
  }

  const handleGenerateDraft = async (id: string) => {
    try {
      await radarService.generateDraft(id)
      loadData()
    } catch (error) {
      toast.error('Failed to generate draft')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await radarService.deleteFollowup(id)
      toast.success('Deleted')
      loadData()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-electric-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-electric-500/20 to-purple-500/20 backdrop-blur-xl border border-electric-500/30">
                  <Radar className="w-6 h-6 text-electric-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Follow-Up Radar
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Emails that follow themselves
                  </p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadData}
              className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors border border-gray-700/50"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Overdue', count: stats.overdueCount, icon: AlertCircle, color: 'red', tab: 'overdue' as TimeframeTab },
              { label: 'Today', count: stats.todayCount, icon: Clock, color: 'orange', tab: 'today' as TimeframeTab },
              { label: 'Upcoming', count: stats.upcomingCount, icon: TrendingUp, color: 'blue', tab: 'upcoming' as TimeframeTab },
              { label: 'You Owe', count: stats.youOweCount, icon: Mail, color: 'purple', direction: 'YOU_OWE' as DirectionTab },
              { label: 'They Owe', count: stats.theyOweCount, icon: Sparkles, color: 'electric', direction: 'THEY_OWE' as DirectionTab }
            ].map((stat, i) => (
              <motion.button
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (stat.tab) setTimeframeTab(stat.tab)
                  if (stat.direction) setDirectionTab(stat.direction)
                }}
                className={`
                  p-4 rounded-xl backdrop-blur-xl border transition-all
                  ${(timeframeTab === stat.tab || directionTab === stat.direction)
                    ? `bg-${stat.color}-500/20 border-${stat.color}-500/50 shadow-lg shadow-${stat.color}-500/20`
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {stat.count}
                    </div>
                    <div className="text-xs text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 mb-6">
            {/* Timeframe Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-gray-800/50 border border-gray-700/50">
              {(['overdue', 'today', 'upcoming'] as TimeframeTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimeframeTab(tab)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${timeframeTab === tab
                      ? 'bg-electric-500/20 text-electric-300 border border-electric-500/30'
                      : 'text-gray-400 hover:text-white'
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Direction Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-gray-800/50 border border-gray-700/50">
              {(['all', 'YOU_OWE', 'THEY_OWE'] as DirectionTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDirectionTab(tab)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${directionTab === tab
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-400 hover:text-white'
                    }
                  `}
                >
                  {tab === 'all' ? 'All' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Followup List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-500" />
            </div>
          ) : followups.length === 0 ? (
            <EmptyState showOnboarding={showOnboarding} />
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {followups.map((followup) => (
                  <FollowupCard
                    key={followup.id}
                    followup={followup}
                    onDone={handleDone}
                    onSnooze={handleSnooze}
                    onGenerateDraft={handleGenerateDraft}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ showOnboarding }: { showOnboarding: boolean }) {
  const { user } = useAuth()
  const userEmail = user?.email?.split('@')[0] || 'you'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-20"
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6 inline-block p-6 rounded-2xl bg-gradient-to-br from-electric-500/20 to-purple-500/20 backdrop-blur-xl border border-electric-500/30">
          <Radar className="w-16 h-16 text-electric-400" />
        </div>

        {showOnboarding ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">
              Start tracking follow-ups
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              BCC Velora on your emails and we'll remind you when it's time to follow up - with a ready-to-send draft and the exact quote that triggered it.
            </p>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-left mb-8">
              <h3 className="text-white font-medium mb-4">Quick start:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-electric-500/20 text-electric-400 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-gray-300">
                      <span className="font-mono text-electric-400">BCC: 2d@in.velora.cc</span> → Get reminded in 2 days
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-electric-500/20 text-electric-400 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-gray-300">
                      <span className="font-mono text-electric-400">BCC: follow@in.velora.cc</span> → We detect the deadline
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-electric-500/20 text-electric-400 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-gray-300">
                      <span className="font-mono text-electric-400">Forward: todo@in.velora.cc</span> → Turn inbound emails into tasks
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:team@velora.cc?subject=Radar%20Beta%20Access"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-electric-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-electric-500/30 transition-all"
              >
                Request Beta Access
              </motion.a>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">
              No follow-ups here
            </h2>
            <p className="text-gray-400">
              Try adjusting your filters or BCC Velora on your next email.
            </p>
          </>
        )}
      </div>
    </motion.div>
  )
}

