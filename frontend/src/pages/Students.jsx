import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Upload, Plus, Search, Trash2, Edit } from 'lucide-react'

export default function Students({ token }) {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ student_id: '', name: '', email: '', department: '', year: 1, cgpa: 0.0 })
  const fileInputRef = useRef(null)

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [token])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setIsUploading(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/upload-csv`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      alert(res.data.message)
      fetchStudents()
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed')
    }
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchStudents()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/students`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowModal(false)
      setFormData({ student_id: '', name: '', email: '', department: '', year: 1, cgpa: 0.0 })
      fetchStudents()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add student')
    }
  }

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.student_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Modal Overlay */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{width: '400px', background: 'var(--bg-card)'}}>
            <h3 style={{marginTop: 0, marginBottom: '1rem'}}>Add New Student</h3>
            <form onSubmit={handleAddSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <input required className="form-control" placeholder="Student ID (e.g., STU-1001)" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} />
              <input required className="form-control" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="email" className="form-control" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input required className="form-control" placeholder="Department (e.g., Computer Science)" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              <div style={{display: 'flex', gap: '1rem'}}>
                <input required type="number" min="1" max="4" className="form-control" placeholder="Year" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
                <input required type="number" step="0.01" min="0" max="10" className="form-control" placeholder="CGPA" value={formData.cgpa} onChange={e => setFormData({...formData, cgpa: parseFloat(e.target.value)})} />
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2>Student Directory</h2>
        <div style={{display: 'flex', gap: '1rem'}}>
          <input 
            type="file" 
            accept=".csv" 
            style={{display: 'none'}} 
            ref={fileInputRef}
            onChange={handleFileUpload} 
          />
          <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload size={16} /> {isUploading ? 'Uploading...' : 'Bulk CSV Upload'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Student
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{marginBottom: '1rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search students..." 
          style={{background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none'}}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="glass-panel" style={{overflowX: 'auto'}}>
        <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border)'}}>
              <th style={{padding: '1rem', color: 'var(--text-muted)'}}>ID</th>
              <th style={{padding: '1rem', color: 'var(--text-muted)'}}>Name</th>
              <th style={{padding: '1rem', color: 'var(--text-muted)'}}>Email</th>
              <th style={{padding: '1rem', color: 'var(--text-muted)'}}>Dept</th>
              <th style={{padding: '1rem', color: 'var(--text-muted)'}}>CGPA</th>
              <th style={{padding: '1rem', color: 'var(--text-muted)'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(student => (
              <tr key={student.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                <td style={{padding: '1rem'}}>{student.student_id}</td>
                <td style={{padding: '1rem', fontWeight: '500'}}>{student.name}</td>
                <td style={{padding: '1rem'}}>{student.email}</td>
                <td style={{padding: '1rem'}}>{student.department}</td>
                <td style={{padding: '1rem', color: student.cgpa >= 8.0 ? 'var(--success)' : 'inherit'}}>{student.cgpa}</td>
                <td style={{padding: '1rem', display: 'flex', gap: '0.5rem'}}>
                  <button className="btn btn-outline" style={{padding: '0.25rem 0.5rem', color: 'var(--primary)', borderColor: 'var(--primary)'}}>
                    <Edit size={14} />
                  </button>
                  <button className="btn btn-outline" style={{padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)'}} onClick={() => handleDelete(student.id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
