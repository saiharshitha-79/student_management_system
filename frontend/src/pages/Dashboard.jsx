import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, Award, AlertTriangle, Download } from 'lucide-react'
import html2pdf from 'html2pdf.js'

const dummyData = [
  { term: 'Fall 2024', avg_cgpa: 6.8, attendance: 78 },
  { term: 'Spring 2025', avg_cgpa: 7.2, attendance: 82 },
  { term: 'Fall 2025', avg_cgpa: 7.5, attendance: 85 },
  { term: 'Spring 2026', avg_cgpa: 8.1, attendance: 90 },
]

export default function Dashboard({ token }) {
  const [prediction, setPrediction] = useState(null)
  const reportRef = useRef()
  
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await axios.get('http://localhost:8000/ai/predict-performance/STU-1001', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPrediction(res.data)
      } catch (err) {
        console.error("Failed to fetch prediction", err)
      }
    }
    fetchPrediction()
  }, [token])

  const downloadPDF = () => {
    const element = reportRef.current
    const opt = {
      margin: 1,
      filename: 'AI_Student_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    }
    html2pdf().set(opt).from(element).save()
  }

  return (
    <div ref={reportRef} style={{padding: '1rem'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2>AI Analytics Dashboard</h2>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <div style={{color: 'var(--text-muted)'}}>Last updated: Just now</div>
          <button className="btn btn-outline" onClick={downloadPDF} style={{borderColor: 'var(--primary)', color: 'var(--primary)'}}>
            <Download size={16} /> Export PDF Report
          </button>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
        <div className="glass-panel">
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
            <TrendingUp color="var(--success)" />
            <h3 style={{color: 'var(--text-muted)', fontSize: '1rem', margin: 0}}>Predicted Final CGPA</h3>
          </div>
          <div style={{fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-main)'}}>
            {prediction ? prediction.predicted_cgpa : '...'}
          </div>
        </div>

        <div className="glass-panel">
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
            <Award color="var(--primary)" />
            <h3 style={{color: 'var(--text-muted)', fontSize: '1rem', margin: 0}}>Placement Readiness</h3>
          </div>
          <div style={{fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)'}}>
            {prediction ? `${prediction.readiness_score}%` : '...'}
          </div>
        </div>

        <div className="glass-panel" style={{border: prediction && prediction.risk_level === 'High Risk' ? '1px solid var(--danger)' : ''}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
            <AlertTriangle color={prediction && prediction.risk_level === 'High Risk' ? 'var(--danger)' : 'var(--warning)'} />
            <h3 style={{color: 'var(--text-muted)', fontSize: '1rem', margin: 0}}>AI Risk Assessment</h3>
          </div>
          <div style={{fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)'}}>
            {prediction ? prediction.risk_level : '...'}
          </div>
          <p style={{color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem'}}>
            {prediction ? prediction.recommendation : '...'}
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{height: '400px'}}>
        <h3 style={{marginBottom: '1.5rem'}}>University-Wide Performance Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dummyData}>
            <defs>
              <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="term" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" domain={[5, 10]} />
            <Tooltip contentStyle={{background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '8px'}} />
            <Area type="monotone" dataKey="avg_cgpa" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCgpa)" name="Average CGPA" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
