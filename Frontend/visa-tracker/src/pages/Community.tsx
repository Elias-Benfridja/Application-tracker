import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

interface QuestionItem {
  id: number
  title: string
  body: string
  country: string
  purpose: string
  author: string
  created_at: string
  comment_count: number
}

const PURPOSES = ['Student Visa', 'Work Permit', 'Tourist / Visitor', 'Permanent Residency', 'Business Visa']

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Community() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filterCountry, setFilterCountry] = useState('')
  const [filterPurpose, setFilterPurpose] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [country, setCountry] = useState('')
  const [purpose, setPurpose] = useState(PURPOSES[0])
  const [posting, setPosting] = useState(false)

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filterCountry) params.country = filterCountry
      if (filterPurpose) params.purpose = filterPurpose
      const response = await api.get('/community/', { params })
      setQuestions(response.data)
    } catch {
      setError('Could not load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCountry, filterPurpose])

  const handleAsk = async () => {
    if (!title.trim() || !body.trim() || !country.trim()) {
      setError('Please fill in all fields')
      return
    }
    setError('')
    setPosting(true)
    try {
      const response = await api.post('/community/', { title, body, country, purpose })
      setShowModal(false)
      setTitle('')
      setBody('')
      setCountry('')
      navigate(`/community/${response.data.id}`)
    } catch {
      setError('Could not post your question. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="bg-background text-on-background font-body-lg min-h-screen flex flex-col">
      {/* Header */}
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
              Community
            </span>
          </div>
          <button
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2 text-white"
            onClick={() => setShowModal(true)}
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Ask a Question
          </button>
        </nav>
      </header>

      {/* Main */}
      <main className="grow max-w-max-width-content w-full mx-auto px-gutter py-stack-lg">
        <div className="mb-stack-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-1">
            Community Q&amp;A
          </h1>
          <p className="text-on-surface-variant font-body-lg">
            Ask questions and get answers from people who've been through the same visa process.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-stack-md mb-stack-lg">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              map
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary font-body-lg bg-surface"
              placeholder="Filter by country (e.g. Australia)"
              type="text"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-outline-variant rounded focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary font-body-lg bg-surface appearance-none"
            value={filterPurpose}
            onChange={(e) => setFilterPurpose(e.target.value)}
          >
            <option value="">All purposes</option>
            {PURPOSES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded text-body-sm font-body-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-on-surface-variant">Loading questions...</p>
        ) : questions.length === 0 ? (
          <div className="text-center py-stack-lg text-on-surface-variant">
            No questions yet. Be the first to ask one!
          </div>
        ) : (
          <div className="flex flex-col gap-stack-md">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg hover:border-secondary transition-all cursor-pointer"
                onClick={() => navigate(`/community/${q.id}`)}
              >
                <div className="flex justify-between items-start gap-stack-md">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-1">
                      {q.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {q.body}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-secondary whitespace-nowrap">
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    <span className="font-body-sm text-body-sm">{q.comment_count}</span>
                  </div>
                </div>
                <div className="flex items-center gap-stack-sm mt-stack-sm">
                  <span className="text-on-surface-variant font-body-sm bg-surface-container px-2 py-0.5 rounded">
                    {q.country}
                  </span>
                  <span className="text-on-surface-variant font-body-sm bg-surface-container px-2 py-0.5 rounded">
                    {q.purpose}
                  </span>
                  <span className="text-outline font-body-sm ml-auto">
                    Asked by {q.author} · {formatDate(q.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Ask a Question Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-headline-md text-headline-md text-primary">
                Ask a Question
              </h2>
              <button
                className="text-on-surface-variant hover:text-primary"
                onClick={() => setShowModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-stack-md">
              <div>
                <label className="block text-label-caps text-outline uppercase mb-1">
                  Title
                </label>
                <input
                  className="w-full px-4 py-2 border border-outline-variant rounded focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary font-body-lg bg-surface"
                  placeholder="e.g. How long did the visa interview take?"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-label-caps text-outline uppercase mb-1">
                  Details
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-outline-variant rounded focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary font-body-lg bg-surface min-h-25"
                  placeholder="Give some context so others can help..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              <div className="flex gap-stack-md">
                <div className="flex-1">
                  <label className="block text-label-caps text-outline uppercase mb-1">
                    Country
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-outline-variant rounded focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary font-body-lg bg-surface"
                    placeholder="e.g. Australia"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-label-caps text-outline uppercase mb-1">
                    Purpose
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-outline-variant rounded focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary font-body-lg bg-surface appearance-none"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  >
                    {PURPOSES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              {error && <p className="text-error text-body-sm">{error}</p>}
              <div className="pt-4 flex gap-stack-md">
                <button
                  className="flex-1 px-4 py-2 border border-primary text-primary rounded font-medium hover:bg-surface-container transition-colors"
                  onClick={() => setShowModal(false)}
                  type="button"
                  disabled={posting}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-primary text-on-primary rounded font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 text-white"
                  onClick={handleAsk}
                  disabled={posting}
                >
                  {posting ? 'Posting...' : 'Post Question'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Community