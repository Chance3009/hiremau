import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

function App() {
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !name) return
    setLoading(true)
    try {
      // 1. Upload file to Supabase Storage
      const filePath = `${file.name}`
      const { error: uploadError } = await supabase.storage.from('other-docs').upload(filePath, file)
      if (uploadError) {
        alert('File upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }
      // 2. Get public URL
      const { data } = supabase.storage.from('other-docs').getPublicUrl(filePath)
      const publicUrl = data?.publicUrl
      if (!publicUrl) {
        alert('Failed to get public URL')
        setLoading(false)
        return
      }
      // 3. Insert name and publicUrl into 'test' table and get uuid
      const { data: insertedRows, error: insertError } = await supabase.from('test').insert([{ name, url: publicUrl }]).select()
      if (insertError) {
        alert('Failed to insert into table: ' + insertError.message)
        setLoading(false)
        return
      }
      const uuid = insertedRows && insertedRows[0] && (insertedRows[0].id || insertedRows[0].uuid)
      // 4. Send public URL, name, and uuid to backend for download
      const backendResponse = await fetch('http://localhost:8000/add-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url: publicUrl, uuid })
      })
      if (!backendResponse.ok) {
        alert('Backend failed to download the file.')
        setLoading(false)
        return
      }
      alert('Success! File uploaded, data saved, and backend download triggered. Row UUID: ' + uuid)
      setName('')
      setFile(null)
      e.target.reset()
    } catch (err) {
      alert('Unexpected error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 320 }}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ marginLeft: 8, padding: 4, width: '100%' }}
          />
        </label>
        <label>
          Upload file:
          <input
            type="file"
            onChange={e => setFile(e.target.files[0])}
            required
            style={{ marginLeft: 8 }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ padding: 8, background: '#6366f1', color: 'white', border: 'none', borderRadius: 4 }}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

export default App
