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
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return { done, total, percent }
}

function getStatusLabel(percent: number, deadline: string) {
  const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return { label: 'Overdue', bg: '#FFEAEA', color: '#B3261E' }
  if (percent < 50 && daysLeft <= 30) return { label: 'Action Required', bg: '#FFF4E5', color: '#B45309' }
  return { label: 'On Track', bg: '#E6F4EA', color: '#0D652D' }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Dashboard() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [country, setCountry] = useState('')
  const [purpose, setPurpose] = useState('Student Visa')
  const [deadline, setDeadline] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

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

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  const handleCreate = async () => {
    if (!country || !deadline) {
      setError('Please fill in all fields')
      return
    }
    setError('')
    setCreating(true)
    try {
      const response = await api.post('/application/', { country, purpose, deadline })
      setShowModal(false)
      setCountry('')
      setDeadline('')
      navigate(`/application/${response.data.id}`)
    } catch {
      setError('Could not create application. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="bg-background text-on-background font-body-lg min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full top-0 bg-surface-lowest border-b border-outline-variant z-50">
        <nav className="flex justify-between items-center h-16 px-gutter max-w-max-width-content mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-primary">VisaTrack</div>
          <div className="hidden md:flex items-center gap-stack-lg">
            <a className="text-primary font-bold border-b-2 border-primary pb-1 font-body-lg transition-colors" href="#">Dashboard</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors font-body-lg" href="#">Documents</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors font-body-lg" href="#">Deadlines</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors font-body-lg" href="#">Support</a>
          </div>
          <div className="flex items-center gap-stack-md">
            <button
              className="cursor-pointer active:opacity-80 transition-opacity text-on-surface-variant font-medium hover:text-primary font-body-lg px-4 py-2"
              onClick={handleLogout}
            >
              Logout
            </button>
            <button
              className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2 text-white"
              onClick={() => setShowModal(true)}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Visa
            </button>
          </div>
        </nav>
      </header>

      {/* Main */}
      <main className="grow max-w-max-width-content w-full mx-auto px-gutter py-stack-lg">
        <div className="flex flex-col md:flex-row justify-between items-end mb-stack-lg gap-stack-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Your Applications</h1>
            <p className="text-on-surface-variant font-body-lg">Track your migration progress and upcoming deadlines.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded text-body-sm font-body-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-on-surface-variant">Loading your applications...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => {
              const { done, total, percent } = getProgress(app.checklist)
              const status = getStatusLabel(percent, app.deadline)
              return (
                <div
                  key={app.id}
                  className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg hover:border-secondary transition-all group cursor-pointer"
                  onClick={() => navigate(`/application/${app.id}`)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-secondary">public</span>
                        <h3 className="font-headline-md text-headline-md text-primary">{app.country}</h3>
                      </div>
                      <p className="text-on-surface-variant font-body-sm bg-surface-container px-2 py-0.5 rounded inline-block">
                        {app.purpose}
                      </p>
                    </div>
                    <div
                      className="circular-progress flex items-center justify-center text-label-caps text-secondary font-bold"
                      style={{ ['--percent' as string]: percent }}
                    >
                      {done}/{total}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">event</span>
                      <div>
                        <p className="text-label-caps uppercase text-outline">Deadline</p>
                        <p className="font-body-lg text-primary font-medium">{formatDate(app.deadline)}</p>
                      </div>
                    </div>
                    <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-outline-variant flex justify-between items-center">
                    <span
                      className="px-2 py-1 rounded text-status-label"
                      style={{ backgroundColor: status.bg, color: status.color }}
                    >
                      {status.label}
                    </span>
                    <button className="text-secondary font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Details <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Add New Placeholder */}
            <button
              className="border-2 border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center p-8 hover:bg-surface-container transition-colors min-h-65"
              onClick={() => setShowModal(true)}
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-[32px]">add</span>
              </div>
              <p className="font-headline-md text-primary">Add New Application</p>
              <p className="text-on-surface-variant font-body-sm mt-1">Start your journey to a new country</p>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bottom-0 bg-surface-container border-t border-outline-variant mt-stack-lg">
        <div className="flex flex-col md:flex-row justify-between items-center py-stack-lg px-gutter max-w-max-width-content mx-auto">
          <div className="mb-4 md:mb-0">
            <div className="text-headline-md font-headline-md font-bold text-primary mb-2">VisaTrack</div>
            <p className="text-on-surface-variant font-body-sm">© 2024 VisaTrack. All rights reserved.</p>
          </div>
          <div className="flex gap-stack-lg">
            <a className="text-on-surface-variant hover:underline transition-colors font-body-sm" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:underline transition-colors font-body-sm" href="#">Terms of Service</a>
            <a className="text-on-surface-variant hover:underline transition-colors font-body-sm" href="#">Contact Us</a>
            <a className="text-on-surface-variant hover:underline transition-colors font-body-sm" href="#">Help Center</a>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-headline-md text-headline-md text-primary">New Application</h2>
              <button className="text-on-surface-variant hover:text-primary" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-stack-md">
              <div>
                <label className="block text-label-caps text-outline uppercase mb-1">Destination Country</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">map</span>
                  <input
                    className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary font-body-lg bg-surface"
                    placeholder="e.g. Australia"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-label-caps text-outline uppercase mb-1">Purpose of Travel</label>
                <select
                  className="w-full px-4 py-2 border border-outline-variant rounded focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary font-body-lg bg-surface appearance-none"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  <option>Student Visa</option>
                  <option>Work Permit</option>
                  <option>Tourist / Visitor</option>
                  <option>Permanent Residency</option>
                  <option>Business Visa</option>
                </select>
              </div>
              <div>
                <label className="block text-label-caps text-outline uppercase mb-1">Submission Deadline</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">calendar_today</span>
                  <input
                    className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary font-body-lg bg-surface"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
              {error && <p className="text-error text-body-sm">{error}</p>}
              <div className="pt-4 flex gap-stack-md">
                <button
                  className="flex-1 px-4 py-2 border border-primary text-primary rounded font-medium hover:bg-surface-container transition-colors"
                  onClick={() => setShowModal(false)}
                  type="button"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-primary text-on-primary rounded font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 text-white"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? 'Generating checklist...' : 'Create Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard