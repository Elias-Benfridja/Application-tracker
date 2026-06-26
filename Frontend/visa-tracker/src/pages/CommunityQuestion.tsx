import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api/axios'

interface CommentItem {
  id: number
  author: string
  body: string
  created_at: string
}

interface QuestionDetail {
  id: number
  title: string
  body: string
  country: string
  purpose: string
  author: string
  created_at: string
  comments: CommentItem[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CommunityQuestion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [question, setQuestion] = useState<QuestionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [posting, setPosting] = useState(false)

  const fetchQuestion = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/community/${id}/`)
      setQuestion(response.data)
    } catch {
      setError('Could not load this question')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestion()
  }, [id])

  const handlePostComment = async () => {
    if (!commentBody.trim()) return
    setPosting(true)
    try {
      await api.post(`/community/${id}/comments/`, { body: commentBody })
      setCommentBody('')
      fetchQuestion()
    } catch {
      setError('Could not post your answer. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
        Loading question...
      </div>
    )
  }

  if (error && !question) {
    return (
      <div className="min-h-screen flex items-center justify-center text-error">
        {error}
      </div>
    )
  }

  if (!question) return null

  return (
    <div className="font-body-lg text-body-lg min-h-screen bg-surface-bright">
      {/* Header */}
      <header className="w-full top-0 bg-surface-lowest border-b border-outline-variant z-50 sticky">
        <div className="flex justify-between items-center h-16 px-gutter max-w-max-width-content mx-auto">
          <div className="flex items-center gap-stack-lg">
            <span className="text-headline-md font-headline-md font-bold text-primary">VisaTrack</span>
            <nav className="hidden md:flex gap-stack-md">
              <Link
                className="font-body-lg text-body-lg text-on-surface-variant font-medium hover:text-primary transition-colors"
                to="/"
              >
                Dashboard
              </Link>
              <Link
                className="font-body-lg text-body-lg text-on-surface-variant font-medium hover:text-primary transition-colors"
                to="/community"
              >
                Community
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-max-width-content mx-auto px-gutter py-stack-lg">
        <button
          className="flex items-center gap-base text-secondary font-body-sm font-medium mb-stack-md cursor-pointer"
          onClick={() => navigate('/community')}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Community
        </button>

        {/* Question */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-container-padding mb-stack-lg p-5">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-stack-sm">
            {question.title}
          </h1>
          <div className="flex items-center gap-stack-sm mb-stack-md">
            <span className="text-on-surface-variant font-body-sm bg-surface-container px-2 py-0.5 rounded">
              {question.country}
            </span>
            <span className="text-on-surface-variant font-body-sm bg-surface-container px-2 py-0.5 rounded">
              {question.purpose}
            </span>
            <span className="text-outline font-body-sm">
              Asked by {question.author} · {formatDate(question.created_at)}
            </span>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant whitespace-pre-wrap">
            {question.body}
          </p>
        </section>

        {/* Comments */}
        <section>
          <h2 className="font-headline-md text-headline-md text-primary mb-stack-md">
            {question.comments.length} {question.comments.length === 1 ? 'Answer' : 'Answers'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded text-body-sm font-body-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-stack-md mb-stack-lg">
            {question.comments.length === 0 && (
              <p className="text-on-surface-variant font-body-sm">
                No answers yet. Share what you know!
              </p>
            )}
            {question.comments.map((c) => (
              <div
                key={c.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md"
              >
                <p className="font-body-lg text-body-lg text-on-surface whitespace-pre-wrap mb-stack-sm">
                  {c.body}
                </p>
                <p className="text-outline font-body-sm">
                  {c.author} · {formatDate(c.created_at)}
                </p>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md">
            <label className="block text-label-caps text-outline uppercase mb-stack-sm">
              Your Answer
            </label>
            <textarea
              className="w-full px-4 py-2 border border-outline-variant rounded focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary font-body-lg bg-surface min-h-25 mb-stack-sm"
              placeholder="Share your experience..."
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-primary text-on-primary rounded font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 text-white"
              onClick={handlePostComment}
              disabled={posting || !commentBody.trim()}
            >
              {posting ? 'Posting...' : 'Post Answer'}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default CommunityQuestion