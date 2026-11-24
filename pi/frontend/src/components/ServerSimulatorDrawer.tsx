import { useState } from 'react'
import { Image as ImageIcon, MessageSquare, Radio, Send, X } from 'lucide-react'
import './ServerSimulatorDrawer.css'

interface ServerSimulatorDrawerProps {
  onClose: () => void
}

export function ServerSimulatorDrawer({ onClose }: ServerSimulatorDrawerProps) {
  const [simText, setSimText] = useState('Good morning! Remember your meeting at 9:00 AM.')
  const [simSender, setSimSender] = useState('Home Server')
  const [simMediaUrl, setSimMediaUrl] = useState(
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
  )
  const [simCaption, setSimCaption] = useState('Rise and shine!')

  const sendTestMessage = async () => {
    await fetch('/api/commands/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: simText,
        sender: simSender,
        duration_seconds: 20,
      }),
    })
    onClose()
  }

  const sendTestMedia = async () => {
    await fetch('/api/commands/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: simMediaUrl,
        caption: simCaption,
        media_type: 'image',
        duration_seconds: 20,
      }),
    })
    onClose()
  }

  return (
    <aside className="drawer-panel">
      <div className="drawer-header">
        <h2>
          <Radio size={22} /> Server Simulator
        </h2>
        <button
          type="button"
          className="touch-icon-delete"
          onClick={onClose}
          aria-label="Close Server Simulator"
        >
          <X size={24} />
        </button>
      </div>

      <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '16px' }}>
        Test what the remote server will send to the Raspberry Pi over the FastAPI API.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            padding: '16px',
            borderRadius: '14px',
          }}
        >
          <h4
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
            }}
          >
            <MessageSquare size={18} /> Send Custom Message
          </h4>
          <div className="form-group">
            <label htmlFor="sim-sender">Sender Name</label>
            <input
              id="sim-sender"
              type="text"
              value={simSender}
              onChange={(e) => setSimSender(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sim-text">Message Content</label>
            <input
              id="sim-text"
              type="text"
              value={simText}
              onChange={(e) => setSimText(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="touch-btn touch-btn-primary"
            onClick={sendTestMessage}
            style={{ width: '100%' }}
          >
            <Send size={20} /> Push to Screen
          </button>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            padding: '16px',
            borderRadius: '14px',
          }}
        >
          <h4
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
            }}
          >
            <ImageIcon size={18} /> Send Photo or GIF
          </h4>
          <div className="form-group">
            <label htmlFor="sim-media-url">Image / GIF URL</label>
            <input
              id="sim-media-url"
              type="text"
              value={simMediaUrl}
              onChange={(e) => setSimMediaUrl(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sim-caption">Caption</label>
            <input
              id="sim-caption"
              type="text"
              value={simCaption}
              onChange={(e) => setSimCaption(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="touch-btn touch-btn-primary"
            onClick={sendTestMedia}
            style={{ width: '100%' }}
          >
            <Send size={20} /> Push Media to Screen
          </button>
        </div>
      </div>
    </aside>
  )
}
