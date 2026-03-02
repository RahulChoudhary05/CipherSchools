import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AttemptPage from './pages/AttemptPage'
import LoginSignup from './components/LoginSignup'
import UserProfile from './components/UserProfile'
import CipherLogo from './components/CipherLogo'
import './App.scss'

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="loading-screen" style={{ height: '100vh' }}>
        <CipherLogo size={64} className="pulse-anim" />
        <p className="loading-screen__text">Checking authentication...</p>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Assignment page without Layout */}
        <Route path="assignment/:id" element={<AttemptPage />} />
        
        {/* Other routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
        </Route>
        <Route path="/login" element={<LoginSignup />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
