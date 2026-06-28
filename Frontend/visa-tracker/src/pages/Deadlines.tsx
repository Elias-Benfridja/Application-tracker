import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface DocumentItem {
  name: string
  description: string
  details: string
}

interface ChecklistItem {
  id: number
  status: string
  document: DocumentItem
}

interface ApplicationItem {
  id: number
  country: string
  purpose: string
  deadline: string
  checklist: ChecklistItem[]
}

function getProgress(checklist: ChecklistItem[]) {
  const total = checklist.length
  const done = checklist.filter((item) => item.status === 'D').length
  return { done, total }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDaysLeft(deadline: string) {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

type GroupKey = 'overdue' | 'thisWeek' | 'thisMonth' | 'later'

const GROUP_CONFIG: Record<GroupKey, { label: string; icon: string; color: string }> = {
  overdue: { label: 'Overdue', icon: 'error', color: '#ef4444' },
  thisWeek: { label: 'This Week', icon: 'warning', color: '#f97316' },
  thisMonth: { label: 'This Month', icon: 'calendar_month', color: '#006591' },
  later: { label: 'Later', icon: 'schedule', color: '#64748b' },
}

function getGroupKey(daysLeft: number): GroupKey {
  if (daysLeft < 0) return 'overdue'
  if (daysLeft <= 7) return 'thisWeek'
  if (daysLeft <= 30) return 'thisMonth'
  return 'later'
}

function Deadlines() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      try {
        const response = await api.get('/application/')
        setApplications(response.data)
      } catch {
        setError('Could not load applications')
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  const sortedApplications = [...applications].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  )

  const groups: Record<GroupKey, ApplicationItem[]> = {
    overdue: [],
    thisWeek: [],
    thisMonth: [],
    later: [],
  }
  sortedApplications.forEach((app) => {
    groups[getGroupKey(getDaysLeft(app.deadline))].push(app)
  })

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* Header */}
      <nav className="w-full top-0 bg-surface-lowest border-b border-outline-variant z-50 sticky">
        <div className="flex justify-between items-center h-16 px-gutter max-w-max-width-content mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-primary">VisaTrack</div>
          <div className="hidden md:flex items-center space-x-8 font-body-lg text-body-lg">
            <a
              className="text-on-surface-variant font-medium hover:text-primary transition-colors cursor-pointer"
              onClick={() => navigate('/')}
            >
              Dashboard
            </a>
            <a
              className="text-on-surface-variant font-medium hover:text-primary transition-colors cursor-pointer"
              onClick={() => navigate('/documents')}
            >
              Documents
            </a>
            <a className="text-primary font-bold border-b-2 border-primary pb-1 cursor-pointer">Deadlines</a>
            <a
              className="text-on-surface-variant font-medium hover:text-primary transition-colors cursor-pointer"
              onClick={() => navigate('/community')}
            >
              Community
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 text-body-sm font-medium text-primary border border-outline rounded-lg hover:bg-surface-container-low transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="grow max-w-max-width-content mx-auto px-gutter py-stack-lg w-full">
        <header className="mb-stack-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Upcoming Deadlines</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            All your applications, sorted by urgency.
          </p>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded text-body-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-on-surface-variant">Loading deadlines...</p>
        ) : sortedApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-stack-lg text-center">
            <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-stack-sm">event_available</span>
            <p className="font-headline-md text-headline-md text-primary mb-1">No applications yet</p>
            <p className="text-on-surface-variant font-body-sm">
              Create an application from your dashboard to see deadlines here.
            </p>
          </div>
        ) : (
          <div className="space-y-stack-lg">
            {(Object.keys(GROUP_CONFIG) as GroupKey[]).map((key) => {
              const items = groups[key]
              if (items.length === 0) return null
              const config = GROUP_CONFIG[key]

              return (
                <section key={key}>
                  <div className="flex items-center gap-2 mb-stack-md">
                    <span
                      className="material-symbols-outlined"
                      style={{ color: config.color, fontVariationSettings: "'FILL' 1" }}
                    >
                      {config.icon}
                    </span>
                    <h2 className="font-headline-md text-headline-md" style={{ color: config.color }}>
                      {config.label}
                    </h2>
                  </div>
                  <div className="space-y-stack-sm">
                    {items.map((app) => {
                      const { done, total } = getProgress(app.checklist)
                      return (
                        <div
                          key={app.id}
                          className="group bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex items-center hover:bg-surface-container transition-all cursor-pointer border-l-4"
                          style={{ borderLeftColor: config.color }}
                          onClick={() => navigate(`/application/${app.id}`)}
                        >
                          <div className="grow p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant">
                                <span className="material-symbols-outlined">public</span>
                              </div>
                              <div>
                                <h3 className="font-bold text-body-lg text-primary">{app.country}</h3>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">{app.purpose}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-6">
                              <div className="flex flex-col">
                                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                                  Deadline
                                </span>
                                <span
                                  className="font-body-sm text-body-sm font-semibold"
                                  style={{ color: key === 'overdue' ? config.color : undefined }}
                                >
                                  {formatDate(app.deadline)}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                                  Progress
                                </span>
                                <span className="font-body-sm text-body-sm text-on-surface">
                                  {done} / {total} documents
                                </span>
                              </div>
                              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                                chevron_right
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bottom-0 bg-surface-container border-t border-outline-variant mt-stack-lg">
        <div className="flex flex-col md:flex-row justify-between items-center py-stack-lg px-gutter max-w-max-width-content mx-auto">
          <div className="mb-4 md:mb-0">
            <div className="text-headline-md font-headline-md font-bold text-primary mb-2">VisaTrack</div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">© 2025 VisaTrack. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-on-surface-variant font-body-sm text-body-sm">
            <a className="cursor-pointer hover:underline">Privacy Policy</a>
            <a className="cursor-pointer hover:underline">Terms of Service</a>
            <a className="cursor-pointer hover:underline">Contact Us</a>
            <a className="cursor-pointer hover:underline">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Deadlines