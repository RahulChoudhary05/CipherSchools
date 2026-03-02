import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import CipherLogo from './CipherLogo'
import '../App.scss' // Use the same App.scss for header/footer styles

function Layout() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <Link to="/" className="app-header__logo">
            <div className="app-header__logo-icon"><CipherLogo size={32} /></div>
            <div className="app-header__logo-text">
              <span className="app-header__logo-title">CipherSQLStudio</span>
              <span className="app-header__logo-subtitle">SQL Learning Platform</span>
            </div>
          </Link>

          <div className="app-header__nav">
            {isAuthenticated ? (
              <div className="app-header__actions">
                <Link to="/profile" className="app-header__profile-button">
                  <span className="app-header__profile-icon">👤</span>
                  <span className="app-header__profile-name">{user?.firstName || user?.email?.split('@')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="app-header__logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              location.pathname !== '/login' && (
                <Link to="/login" className="app-header__signin-btn">
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="app-footer__inner">
          <div className="app-footer__brand">
            <CipherLogo size={20} />
            <div className="app-footer__brand-text">
              <span className="app-footer__brand-title">CipherSQLStudio</span>
              <span className="app-footer__brand-subtitle">Practice SQL with instant feedback and AI hints</span>
            </div>
          </div>

          <div className="app-footer__meta">
            <span className="app-footer__stack">React · Node.js · PostgreSQL · MongoDB</span>
            <span className="app-footer__copy">© 2026 CipherSQLStudio</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
