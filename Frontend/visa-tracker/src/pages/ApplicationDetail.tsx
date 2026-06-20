import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  T: { label: 'Required', bg: '#eceef0', color: '#45464d' },
  P: { label: 'In Progress', bg: '#c9e6ff', color: '#004c6e' },
  D: { label: 'Completed', bg: '#71f8e4', color: '#005048' },
}

function nextStatus(current: string) {
  if (current === 'T') return 'P'
  if (current === 'P') return 'D'
  return 'T'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState<ApplicationItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openIds, setOpenIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/application/${id}/`)
        setApplication(response.data)
      } catch {
        setError('Could not load this application')
      } finally {
        setLoading(false)
      }
    }
    fetchApplication()
  }, [id])

  const toggleDetails = (itemId: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const handleStatusClick = async (item: ChecklistItem) => {
    if (!application) return
    const newStatus = nextStatus(item.status)

    // optimistic update
    setApplication({
      ...application,
      checklist: application.checklist.map((c) =>
        c.id === item.id ? { ...c, status: newStatus } : c
      ),
    })

    try {
      await api.patch(`/application/checklist/${item.id}/`, { status: newStatus })
    } catch {
      // revert on failure
      setApplication({
        ...application,
        checklist: application.checklist.map((c) =>
          c.id === item.id ? { ...c, status: item.status } : c
        ),
      })
      setError('Could not update status, please try again')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
        Loading application...
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center text-error">
        {error || 'Application not found'}
      </div>
    )
  }

  const total = application.checklist.length
  const done = application.checklist.filter((c) => c.status === 'D').length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="font-body-lg text-body-lg min-h-screen bg-surface-bright">
      {/* Header */}
      <header className="w-full top-0 bg-surface-lowest border-b border-outline-variant z-50 sticky">
        <div className="flex justify-between items-center h-16 px-gutter max-w-max-width-content mx-auto">
          <div className="flex items-center gap-stack-lg">
            <span className="text-headline-md font-headline-md font-bold text-primary">VisaTrack</span>
            <nav className="hidden md:flex gap-stack-md">
              <a
                className="font-body-lg text-body-lg text-on-surface-variant font-medium hover:text-primary transition-colors cursor-pointer"
                onClick={() => navigate('/')}
              >
                Dashboard
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-max-width-content mx-auto px-gutter py-stack-lg">
        {/* Application Header */}
        <section className="mb-stack-lg">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-container-padding flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-md">
            <div className="flex items-center gap-stack-md">
              <div className="w-16 h-16 bg-secondary-container/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-4xl">public</span>
              </div>
              <div>
                <h1 className="font-headline-lg text-headline-lg text-primary">{application.country}</h1>
                <p className="font-body-lg text-on-surface-variant">Purpose: {application.purpose}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-base p-5">
              <div className="flex items-center gap-base text-error">
                <span className="material-symbols-outlined text-[20px]">alarm</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider">
                  Deadline: {formatDate(application.deadline)}
                </span>
              </div>
              <div className="w-48 h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary transition-all duration-700" style={{ width: `${percent}%` }}></div>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {done} of {total} tasks completed
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg">
          {/* Checklist */}
          <div className="lg:col-span-2 flex flex-col gap-stack-md">
            <h2 className="font-headline-md text-headline-md text-primary mb-base">Required Documents</h2>

            {application.checklist.map((item) => {
              const config = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.T
              const isOpen = openIds.has(item.id)
              const isDone = item.status === 'D'

              return (
                <div
                  key={item.id}
                  className={`document-card bg-surface-container-lowest border rounded-lg p-stack-md transition-all ${
                    item.status === 'T' ? 'border-outline-variant' : 'border-outline-variant'
                  }`}
                >
                  <div className="flex justify-between items-start mb-stack-sm">
                    <div className="flex items-start gap-stack-sm">
                      <button className="mt-1" onClick={() => handleStatusClick(item)} title="Click to update status">
                        <input
                          checked={isDone}
                          readOnly
                          className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-0 cursor-pointer"
                          type="checkbox"
                        />
                      </button>
                      <div>
                        <h3 className={`font-body-lg text-body-lg font-semibold text-primary ${isDone ? 'opacity-50 line-through' : ''}`}>
                          {item.document.name}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{item.document.description}</p>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1 rounded-full font-status-label text-status-label whitespace-nowrap"
                      style={{ backgroundColor: config.bg, color: config.color }}
                      onClick={() => handleStatusClick(item)}
                    >
                      {config.label}
                    </button>
                  </div>
                  <button
                    className="flex items-center gap-base text-secondary font-body-sm font-medium cursor-pointer"
                    onClick={() => toggleDetails(item.id)}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isOpen ? 'keyboard_arrow_up' : 'info'}
                    </span>
                    Details &amp; Tips
                  </button>
                  {isOpen && (
                    <div className="mt-stack-sm p-stack-sm bg-surface-container-low rounded border border-outline-variant/30 text-body-sm text-on-surface-variant">
                      {item.document.details}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-stack-lg">
            <div className="bg-surface-container rounded-xl p-container-padding p-5">
              <h3 className="font-body-lg font-bold text-primary mb-stack-sm">Need Help?</h3>
              <p className="font-body-sm text-on-surface-variant mb-stack-md">
                Our immigration experts are ready to review your documents to ensure 100% compliance.
              </p>
              <div className="flex flex-col gap-stack-sm">
                <button className="flex items-center justify-center gap-base px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  Chat with Advisor
                </button>
                <button className="flex items-center justify-center gap-base px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[20px]">article</span>
                  Browse Visa Guide
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bottom-0 bg-surface-container border-t border-outline-variant mt-stack-lg">
        <div className="flex flex-col md:flex-row justify-between items-center py-stack-lg px-gutter max-w-max-width-content mx-auto">
          <div className="mb-stack-md md:mb-0">
            <span className="text-headline-md font-headline-md font-bold text-primary">VisaTrack</span>
          </div>
          <div className="flex flex-wrap justify-center gap-stack-md mb-stack-md md:mb-0">
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline transition-colors cursor-pointer">Privacy Policy</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline transition-colors cursor-pointer">Terms of Service</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline transition-colors cursor-pointer">Contact Us</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline transition-colors cursor-pointer">Help Center</a>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 VisaTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default ApplicationDetail