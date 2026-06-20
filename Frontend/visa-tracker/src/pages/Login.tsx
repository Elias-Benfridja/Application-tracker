import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/api/token/', { username, password })
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      navigate('/')
    } catch {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen">
      {/* Header */}
      <header className="w-full fixed top-0 z-50 bg-surface-bright/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex justify-between items-center h-16 px-gutter max-w-max-width-content mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-primary">VisaTrack</div>
          <a className="text-body-sm font-body-sm text-secondary hover:underline transition-all" href="#">Support</a>
        </div>
      </header>

      {/* Main */}
      <main className="min-h-screen flex items-center justify-center pt-16 px-gutter">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden bg-surface-container-lowest border border-outline-variant rounded-lg p-10 shadow-sm">
            
            {/* Security Branding */}
            <div className="flex flex-col items-center mb-stack-lg">
              <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center mb-stack-md">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary text-center">Secure Login</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 text-center">
                Access your global visa and document dashboard
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded text-body-sm font-body-sm text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <div className="space-y-stack-md">
              {/* Username */}
              <div className="space-y-base">
                <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="identifier">
                  EMAIL OR USERNAME
                </label>
                <div className="relative group input-halo transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
                    alternate_email
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded focus:border-secondary focus:ring-0 transition-all font-body-lg text-body-lg text-on-surface placeholder:text-outline/50"
                    id="identifier"
                    placeholder="name@company.com"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-base">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="password">
                    PASSWORD
                  </label>
                </div>
                <div className="relative group input-halo transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">lock</span>
                  <input
                    className="w-full pl-10 pr-10 py-3 bg-white border border-outline-variant rounded focus:border-secondary focus:ring-0 transition-all font-body-lg text-body-lg text-on-surface placeholder:text-outline/50"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                className="w-full py-4 bg-primary text-white font-headline-md text-headline-md rounded hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
                {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
              </button>
            </div>

            {/* Register Link */}
            <div className="mt-stack-lg pt-stack-lg border-t border-outline-variant text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Don't have an account yet?{' '}
                <Link className="text-secondary font-semibold hover:underline transition-all" to="/register">
                  Register
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-stack-lg flex justify-center items-center gap-stack-lg opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="font-label-caps text-label-caps">256-BIT ENCRYPTION</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">gpp_good</span>
              <span className="font-label-caps text-label-caps">GDPR COMPLIANT</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center py-stack-lg px-gutter max-w-max-width-content mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-primary mb-stack-md md:mb-0">VisaTrack</div>
          <div className="flex flex-wrap justify-center gap-stack-md mb-stack-md md:mb-0">
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="#">Privacy Policy</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="#">Terms of Service</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="#">Contact Us</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="#">Help Center</a>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 VisaTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Login