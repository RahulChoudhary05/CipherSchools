import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import CipherLogo from './CipherLogo'
import '../styles/LoginSignup.scss'

const LoginSignup = () => {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          setError("Passwords don't match")
          setLoading(false)
          return
        }
        const result = await signup(email, password, confirmPassword, firstName, lastName)
        if (!result.success) {
          setError(result.error)
        } else {
          navigate('/')
        }
      } else {
        const result = await login(email, password)
        if (!result.success) {
          setError(result.error)
        } else {
          navigate('/')
        }
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="auth-logo__icon" style={{ display: 'flex' }}><CipherLogo size={48} /></span>
          <span className="auth-logo__text">CipherSQLStudio</span>
        </Link>
        
        <div className="auth-header">
          <h1>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{isSignup ? 'Start your SQL learning journey' : 'Sign in to continue learning'}</p>
        </div>

        {error && <div className="status-banner status-banner--error"><span className="status-banner__icon">⚠️</span><span className="status-banner__content">{error}</span></div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <div className="form-row">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="form-input"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />

          {isSignup && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
            />
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', height: '44px', fontSize: '1rem', marginTop: '1rem' }}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : isSignup ? 'Create Account' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup)
                setError('')
              }}
              className="toggle-button"
            >
              {isSignup ? 'Login' : 'Sign up'}
            </button>
          </p>
        </div>

        <Link to="/" className="continue-guest-button btn-ghost" style={{ width: '100%', display: 'flex' }}>
          Continue as Guest
        </Link>
      </div>
    </div>
  )
}

export default LoginSignup
