import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assignmentsAPI, progressAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import AttemptView from '../components/AttemptView'
import CipherLogo from '../components/CipherLogo'

function AttemptPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [assignment, setAssignment] = useState(null)
  const [initialQuery, setInitialQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function fetchAssignmentData() {
      try {
        setLoading(true)
        const response = await assignmentsAPI.getById(id)
        if (active) setAssignment(response.data.data)

        // If authenticated, also try fetching their previous code
        if (isAuthenticated) {
          try {
            const progRes = await progressAPI.getAssignmentProgress(id)
            if (active && progRes.data?.progress?.sqlQuery) {
              setInitialQuery(progRes.data.progress.sqlQuery)
            }
          } catch {
            // Ignore errors; user can still start a fresh attempt
          }
        }
      } catch (err) {
        if (active) setError(err.response?.data?.error || 'Failed to load assignment')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchAssignmentData()

    return () => {
      active = false
    }
  }, [id, isAuthenticated])

  useEffect(() => {
    return () => {
      if (assignment?.workspaceId) {
        assignmentsAPI.deleteWorkspace(assignment.workspaceId).catch(() => {})
      }
    }
  }, [assignment])

  const handleBack = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="loading-screen" style={{ height: '80vh' }}>
        <CipherLogo size={64} className="pulse-anim" />
        <p className="loading-screen__text">Loading assignment workspace...</p>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="global-error" style={{ margin: '1rem' }}>
        <span>⚠️ {error || 'Assignment not found'}</span>
        <button className="btn-ghost" onClick={handleBack}>Go Back</button>
      </div>
    )
  }

  return (
    <AttemptView 
      assignment={assignment} 
      onBack={handleBack}
      initialQuery={initialQuery}
    />
  )
}

export default AttemptPage
