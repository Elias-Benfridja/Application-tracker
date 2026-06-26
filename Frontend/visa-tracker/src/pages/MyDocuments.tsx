import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

interface MyDocumentItem {
  id: number
  document: { name: string; description: string; details: string }
  application_id: number
  country: string
  purpose: string
  status: string
  attachment: string
}

const STATUS_LABEL: Record<string, string> = {
  T: 'Required',
  P: 'In Progress',
  D: 'Completed',
}

function fileNameFromUrl(url: string) {
  try {
    return decodeURIComponent(url.split('/').pop() ?? url)
  } catch {
    return url
  }
}

function isImage(url: string) {
  return /\.(png|jpe?g)$/i.test(url)
}

function MyDocuments() {
  const navigate = useNavigate()
  const [items, setItems] = useState<MyDocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true)
      try {
        const response = await api.get('/application/documents/')
        setItems(response.data)
      } catch {
        setError('Could not load your documents')
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [])

  // group flat list by application so it's easy to scan
  const grouped = items.reduce<Record<number, MyDocumentItem[]>>((acc, item) => {
    acc[item.application_id] = acc[item.application_id] || []
    acc[item.application_id].push(item)
    return acc
  }, {})

  return (
    <div className="bg-background text-on-background font-body-lg min-h-screen flex flex-col">
      <header className="w-full top-0 bg-surface-lowest border-b border-outline-variant z-50">
        <nav className="flex justify-between items-center h-16 px-gutter max-w-max-width-content mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-primary">
            VisaTrack
          </div>
          <div className="hidden md:flex items-center gap-stack-lg">
            <Link
              to="/"
              className="text-on-surface-variant font-medium hover:text-primary transition-colors font-body-lg"
            >
              Dashboard
            </Link>
            <span className="text-primary font-bold border-b-2 border-primary pb-1 font-body-lg transition-colors">
              Documents
            </span>
            <Link
              to="/community"
              className="text-on-surface-variant font-medium hover:text-primary transition-colors font-body-lg"
            >
              Community
            </Link>
          </div>
        </nav>
      </header>

      <main className="grow max-w-max-width-content w-full mx-auto px-gutter py-stack-lg">
        <div className="mb-stack-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-1">My Documents</h1>
          <p className="text-on-surface-variant font-body-lg">
            Every file you've uploaded, across all your applications.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded text-body-sm font-body-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-on-surface-variant">Loading documents...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-stack-lg text-on-surface-variant">
            Nothing has been uploaded yet.
          </div>
        ) : (
          <div className="flex flex-col gap-stack-lg">
            {Object.entries(grouped).map(([appId, docs]) => (
              <section key={appId}>
                <button
                  className="flex items-center gap-base text-secondary font-body-sm font-medium mb-stack-sm cursor-pointer"
                  onClick={() => navigate(`/application/${appId}`)}
                >
                  <span className="material-symbols-outlined text-[18px]">folder_open</span>
                  {docs[0].country} · {docs[0].purpose}
                </button>
                <div className="flex flex-col gap-stack-sm">
                  {docs.map((item) => (
                    <a
                      key={item.id}
                      href={item.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-stack-md bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md hover:border-secondary transition-all"
                    >
                      <div className="flex items-center gap-stack-sm">
                        <span className="material-symbols-outlined text-secondary">
                          {isImage(item.attachment) ? 'image' : 'description'}
                        </span>
                        <div>
                          <p className="font-body-lg text-body-lg font-semibold text-primary">
                            {item.document.name}
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {fileNameFromUrl(item.attachment)}
                          </p>
                        </div>
                      </div>
                      <span className="font-status-label text-status-label text-on-surface-variant whitespace-nowrap">
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default MyDocuments