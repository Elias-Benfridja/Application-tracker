import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useProfile } from '../hooks/useProfile'
import UpgradeModal from '../components/UpgradeModal'

interface DocumentItem {
  name: string
  description: string
  details: string
}

interface ChecklistItem {
  id: number
  status: string
  document: DocumentItem
  attachment: string | null
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
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [guideText, setGuideText] = useState('')
  const [guideLoading, setGuideLoading] = useState(false)
  const [guideError, setGuideError] = useState('')
  const { profile, upgrading, upgrade } = useProfile()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [uploadingIds, setUploadingIds] = useState<Set<number>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deletingApp, setDeletingApp] = useState(false)
  const [deletingAttachmentIds, setDeletingAttachmentIds] = useState<Set<number>>(new Set())

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

  const updateStatus = async (item: ChecklistItem, newStatus: string) => {
    if (!application) return

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

  const uploadAttachment = async (item: ChecklistItem, file: File) => {
    if (!application) return

    setUploadingIds((prev) => new Set(prev).add(item.id))
    setError('')

    const formData = new FormData()
    formData.append('attachment', file)

    try {
      const response = await api.patch(`/application/checklist/${item.id}/`, formData)
      setApplication((prev) =>
        prev
          ? {
              ...prev,
              checklist: prev.checklist.map((c) =>
                c.id === item.id ? { ...c, attachment: response.data.attachment } : c
              ),
            }
          : prev
      )
    } catch {
      setError('Could not upload file, please try again')
    } finally {
      setUploadingIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  const deleteApplication = async () => {
    setDeletingApp(true)
    try {
      await api.delete(`/application/${id}/`)
      navigate('/')
    } catch {
      setError('Could not delete application, please try again')
      setDeletingApp(false)
      setConfirmDelete(false)
    }
  }

  const deleteAttachment = async (item: ChecklistItem) => {
    if (!application) return
    setDeletingAttachmentIds((prev) => new Set(prev).add(item.id))
    try {
      await api.patch(`/application/checklist/${item.id}/`, { attachment: null })
      setApplication((prev) =>
        prev
          ? {
              ...prev,
              checklist: prev.checklist.map((c) =>
                c.id === item.id ? { ...c, attachment: null } : c
              ),
            }
          : prev
      )
    } catch {
      setError('Could not delete file, please try again')
    } finally {
      setDeletingAttachmentIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !application) return
    const question = chatInput
    setChatMessages((prev) => [...prev, { role: 'user', text: question }])
    setChatInput('')
    setChatLoading(true)
    try {
      const response = await api.post(`/application/${application.id}/chat/`, { question })
      setChatMessages((prev) => [...prev, { role: 'assistant', text: response.data.answer }])
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, I could not process that question.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const openChat = () => {
    if (!profile?.isPro) {
      setShowUpgradeModal(true)
      return
    }
    setShowChat(true)
  }

  const handleUpgrade = async () => {
    const success = await upgrade()
    if (success) {
      setShowUpgradeModal(false)
      setShowChat(true)
    }
  }

  const handleOpenGuide = async () => {
    setShowGuide(true)
    if (guideText) return // already fetched once, no need to call again
    setGuideLoading(true)
    setGuideError('')
    try {
      const response = await api.get(`/application/${application?.id}/guide/`)
      setGuideText(response.data.guide)
    } catch {
      setGuideError('Could not load the guide right now, please try again.')
    } finally {
      setGuideLoading(false)
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
              <a
                className="font-body-lg text-body-lg text-on-surface-variant font-medium hover:text-primary transition-colors cursor-pointer"
                onClick={() => navigate('/community')}
              >
                Community
              </a>
              <a
                className="font-body-lg text-body-lg text-on-surface-variant font-medium hover:text-primary transition-colors cursor-pointer"
                onClick={() => navigate('/documents')}
              >
                Documents
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-max-width-content mx-auto px-gutter py-stack-lg">
        {/* Application Header */}
        <section className="mb-stack-lg">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-container-padding flex flex-col md:flex-row justify-between items-start gap-stack-md">
            <div className="flex items-center gap-stack-md">
              <div className="w-16 h-16 bg-secondary-container/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-4xl">public</span>
              </div>
              <div>
                <h1 className="font-headline-lg text-headline-lg text-primary">{application.country}</h1>
                <p className="font-body-lg text-on-surface-variant">Purpose: {application.purpose}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-stack-sm w-full md:w-auto">
              <button
                className="flex items-center gap-base px-4 py-2 text-error border border-error rounded-lg font-body-sm font-medium hover:bg-error hover:text-white transition-all"
                onClick={() => setConfirmDelete(true)}
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Delete Application
              </button>
              <div className="flex flex-col items-end gap-base mt-stack-sm p-5">
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
                      <div>
                        <h3 className={`font-body-lg text-body-lg font-semibold text-primary ${isDone ? 'opacity-50 line-through' : ''}`}>
                          {item.document.name}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{item.document.description}</p>
                      </div>
                    </div>
                    <select
                      className="px-3 py-1 rounded-full font-status-label text-status-label whitespace-nowrap border-none outline-none cursor-pointer appearance-none"
                      style={{ backgroundColor: config.bg, color: config.color }}
                      value={item.status}
                      onChange={(e) => updateStatus(item, e.target.value)}
                      title="Change status"
                    >
                      <option value="T">{STATUS_CONFIG.T.label}</option>
                      <option value="P">{STATUS_CONFIG.P.label}</option>
                      <option value="D">{STATUS_CONFIG.D.label}</option>
                    </select>
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

                  <div className="flex items-center gap-stack-sm mt-stack-sm pt-stack-sm border-t border-outline-variant/30">
                    <label className="flex items-center gap-base text-secondary font-body-sm font-medium cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">upload_file</span>
                      {uploadingIds.has(item.id)
                        ? 'Uploading...'
                        : item.attachment
                        ? 'Replace file'
                        : 'Upload file'}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        disabled={uploadingIds.has(item.id)}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadAttachment(item, file)
                          e.target.value = ''
                        }}
                      />
                    </label>
                    {item.attachment && (
                      <>
                        <a
                          href={item.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-base text-on-surface-variant font-body-sm hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-[18px]">description</span>
                          View uploaded file
                        </a>
                        <button
                          className="flex items-center gap-base text-error font-body-sm hover:opacity-70 disabled:opacity-40"
                          disabled={deletingAttachmentIds.has(item.id)}
                          onClick={() => deleteAttachment(item)}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          {deletingAttachmentIds.has(item.id) ? 'Deleting...' : 'Delete file'}
                        </button>
                      </>
                    )}
                  </div>
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
                <button
                  className="flex items-center justify-center gap-base px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all"
                  onClick={openChat}
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  Chat with Advisor
                </button>
                <button
                  className="flex items-center justify-center gap-base px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all"
                  onClick={handleOpenGuide}
                >
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
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 VisaTrack. All rights reserved.</p>
        </div>
      </footer>

      {/* Chat with Advisor Panel */}
      {showChat && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-end md:items-center justify-center md:justify-end"
          onClick={(e) => e.target === e.currentTarget && setShowChat(false)}
        >
          <div className="bg-surface-container-lowest w-full md:w-100 md:h-full max-h-[80vh] md:max-h-full rounded-t-xl md:rounded-none shadow-2xl flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-primary-container">
              <div className="flex items-center gap-stack-sm">
                <span className="material-symbols-outlined text-white">support_agent</span>
                <h2 className="font-headline-md text-headline-md text-white">Visa Advisor</h2>
              </div>
              <button className="text-white hover:opacity-70" onClick={() => setShowChat(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-stack-sm">
              {chatMessages.length === 0 && (
                <p className="text-on-surface-variant font-body-sm text-center mt-stack-lg">
                  Ask anything about your {application.country} {application.purpose} application.
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg font-body-sm text-body-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-surface-container text-on-surface rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-lg font-body-sm text-body-sm rounded-bl-none">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-outline-variant flex gap-2">
              <input
                className="flex-1 px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary font-body-sm bg-surface"
                placeholder="Ask a question..."
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !chatLoading && handleSendMessage()}
              />
              <button
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={chatLoading}
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visa Guide Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-gutter"
          onClick={(e) => e.target === e.currentTarget && setShowGuide(false)}
        >
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-stack-sm">
                <span className="material-symbols-outlined text-secondary">article</span>
                <h2 className="font-headline-md text-headline-md text-primary">
                  {application.country} {application.purpose} Guide
                </h2>
              </div>
              <button className="text-on-surface-variant hover:text-primary" onClick={() => setShowGuide(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-stack-md">
              {guideLoading && (
                <p className="text-on-surface-variant font-body-sm text-center">Generating your guide...</p>
              )}
              {guideError && <p className="text-error font-body-sm text-center">{guideError}</p>}
              {!guideLoading &&
                !guideError &&
                guideText.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="font-body-lg text-body-lg text-on-surface-variant">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-gutter">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-stack-md">
            <div className="flex items-center gap-stack-sm text-error">
              <span className="material-symbols-outlined">warning</span>
              <h2 className="font-headline-md text-headline-md">Delete Application?</h2>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              This will permanently delete your <strong>{application.country} {application.purpose}</strong> application and all its documents. This cannot be undone.
            </p>
            <div className="flex gap-stack-sm justify-end">
              <button
                className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-body-sm hover:bg-surface-container transition-all"
                onClick={() => setConfirmDelete(false)}
                disabled={deletingApp}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-error text-white font-body-sm hover:opacity-90 disabled:opacity-50 transition-all"
                onClick={deleteApplication}
                disabled={deletingApp}
              >
                {deletingApp ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      <UpgradeModal
        open={showUpgradeModal}
        reason="Chat with Advisor is a Pro feature."
        upgrading={upgrading}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
      />
    </div>
  )
}

export default ApplicationDetail