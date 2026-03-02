import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AssignmentsView from '../components/AssignmentsView'
import { assignmentsAPI } from '../services/api'
import CipherLogo from '../components/CipherLogo'

let assignmentsCache = []

function HomePage() {
  const [assignments, setAssignments] = useState(assignmentsCache)
  const [loading, setLoading] = useState(!assignmentsCache.length)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchAssignments() {
      if (assignmentsCache.length > 0) return
      try {
        const response = await assignmentsAPI.getAll()
        assignmentsCache = response.data.data || []
        setAssignments(assignmentsCache)
      } catch {
        setError('Failed to load assignments. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [])

  const handleSelectAssignment = (assignment) => {
    navigate(`/assignment/${assignment._id}`)
  }

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: '80vh' }}>
        <CipherLogo size={64} className="pulse-anim" />
        <p className="loading-screen__text">Loading assignments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="global-error" style={{ margin: '1rem' }}>
        <span>⚠️ {error}</span>
      </div>
    )
  }

  return (
    <AssignmentsView
      assignments={assignments}
      onSelectAssignment={handleSelectAssignment}
    />
  )
}

export default HomePage
