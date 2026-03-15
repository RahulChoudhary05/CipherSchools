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

  const fetchAssignmentData = async () => {
    setLoading(true)
    const response = await assignmentsAPI.getById(id)
    setAssignment(response.data.data)

    if (isAuthenticated) {
      try {
        const progRes = await progressAPI.getAssignmentProgress(id)
        if (progRes.data?.progress?.sqlQuery) {
          setInitialQuery(progRes.data.progress.sqlQuery)
        }
      } catch {
        // Ignore progress errors to avoid blocking assignment loading
      }
    }

    setLoading(false)
    return response.data.data
  }

  const refreshWorkspace = async () => {
    const fresh = await assignmentsAPI.getById(id)
    setAssignment(fresh.data.data)
    return fresh.data.data
  }

  useEffect(() => {
    let active = true
    async function loadPageData() {
      try {
        await fetchAssignmentData()
      } catch (err) {
        if (active) setError(err.response?.data?.error || 'Failed to load assignment')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPageData()

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
      onRefreshWorkspace={refreshWorkspace}
    />
  )
}

export default AttemptPage
