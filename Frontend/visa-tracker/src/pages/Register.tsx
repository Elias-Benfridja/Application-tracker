import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setError('')
    setLoading(true)
    try {
      await api.post('/user/register/', { username, email, password })
      navigate('/login')
    } catch {
      setError('Registration failed. Username may already exist.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-bright text-on-surface font-body-lg min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full top-0 bg-surface-lowest border-b border-outline-variant z-50">
        <div className="flex justify-between items-center h-16 px-gutter max-w-max-width-content mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-primary">VisaTrack</div>
          <div className="hidden md:flex items-center gap-stack-lg">
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors font-body-lg text-body-lg" href="#">Support</a>
            <Link className="px-4 py-2 border border-primary text-primary font-medium rounded transition-opacity hover:opacity-80" to="/login">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="grow flex items-center justify-center px-gutter py-stack-lg relative overflow-hidden">
        <div className="w-full max-w-md relative z-10">

          {/* Registration Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-container-padding shadow-sm p-10">
            <div className="mb-stack-lg text-center">
              <h1 className="font-headline-lg text-headline-lg text-primary mb-base">Create Account</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Securely begin your international journey.</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded text-body-sm font-body-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-stack-md">
              {/* Username */}
              <div className="space-y-base">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="username">
                  Username
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">person</span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded font-body-lg text-body-lg form-input-focus transition-all"
                    id="username"
                    placeholder="johndoe_visa"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-base">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded font-body-lg text-body-lg form-input-focus transition-all"
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-base">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                  <input
                    className="w-full pl-10 pr-12 py-3 bg-white border border-outline-variant rounded font-body-lg text-body-lg form-input-focus transition-all"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="font-body-sm text-[10px] text-on-surface-variant mt-1">
                  Minimum 8 characters with at least one number.
                </p>
              </div>

              {/* Register Button */}
              <button
                className="w-full py-4 bg-primary text-on-primary font-headline-md text-headline-md rounded hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-stack-md disabled:opacity-50 text-white"
                onClick={handleRegister}
                disabled={loading}
              >
                <span>{loading ? 'Creating account...' : 'Register'}</span>
                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-stack-lg text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Already have an account?{' '}
                <Link className="text-primary font-bold hover:underline ml-1" to="/login">
                  Login
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-stack-lg flex justify-center items-center gap-stack-lg opacity-60 grayscale">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span className="text-[10px] font-label-caps uppercase">256-bit Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">gpp_good</span>
              <span className="text-[10px] font-label-caps uppercase">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center py-stack-lg px-gutter max-w-max-width-content mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-primary mb-4 md:mb-0">VisaTrack</div>
          <div className="flex gap-stack-md flex-wrap justify-center">
            <a className="text-on-surface-variant hover:underline font-body-sm text-body-sm" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:underline font-body-sm text-body-sm" href="#">Terms of Service</a>
            <a className="text-on-surface-variant hover:underline font-body-sm text-body-sm" href="#">Contact Us</a>
            <a className="text-on-surface-variant hover:underline font-body-sm text-body-sm" href="#">Help Center</a>
          </div>
          <div className="mt-4 md:mt-0 font-body-sm text-body-sm text-on-surface-variant">
            © 2026 VisaTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Register