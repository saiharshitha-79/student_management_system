import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, BookOpen, LogOut, BrainCircuit } from 'lucide-react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import AIChatbot from './components/AIChatbot'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const handleStorage = () => setToken(localStorage.getItem('token'))
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    navigate('/login')
  }

  if (!token) {
    return <Routes><Route path="*" element={<Login setToken={setToken} />} /></Routes>
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <BrainCircuit size={28} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
            SmartUni AI
          </div>
        </div>
        <nav className="nav-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/students" className={`nav-item ${location.pathname === '/students' ? 'active' : ''}`}>
            <Users size={20} /> Students
          </Link>
          <Link to="/courses" className={`nav-item ${location.pathname === '/courses' ? 'active' : ''}`}>
            <BookOpen size={20} /> Academics
          </Link>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <div style={{color: 'var(--text-muted)'}}>AI-Powered Student Management System</div>
          <div style={{display: 'flex', gap: '1rem'}}>
            <button className="btn btn-outline" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button className="btn btn-outline" onClick={handleLogout} style={{borderColor: 'var(--danger)', color: 'var(--danger)'}}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>
        <section className="page-content animate-fade-in">
          <Routes>
            <Route path="/" element={<Dashboard token={token} />} />
            <Route path="/students" element={<Students token={token} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </section>
      </main>

      <AIChatbot token={token} />
    </div>
  )
}

export default App
