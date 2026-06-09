import { useState } from 'react'
import axios from 'axios'
import { BrainCircuit } from 'lucide-react'

export default function Login({ setToken }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isRegistering) {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/register`, { username, password, role: 'admin' })
        setIsRegistering(false)
        alert('Registration successful! Please login.')
        return
      }
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/login`, { username, password })
      localStorage.setItem('token', res.data.access_token)
      setToken(res.data.access_token)
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed')
    }
  }

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div className="glass-panel animate-fade-in" style={{width: '100%', maxWidth: '400px'}}>
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <BrainCircuit size={48} color="var(--primary)" style={{marginBottom: '1rem'}} />
          <h2 style={{color: 'var(--text-main)', fontSize: '1.5rem'}}>SmartUni AI Platform</h2>
          <p style={{color: 'var(--text-muted)'}}>{isRegistering ? 'Create your account' : 'Login to access the dashboard'}</p>
        </div>
        
        {error && <div style={{background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--danger)'}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
            {isRegistering ? 'Register' : 'Access System'}
          </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
          <span style={{color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem'}} onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </span>
        </div>
      </div>
    </div>
  )
}
