import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { memeService } from '../services'
import './MemeUpload.css'

function MemeUpload() {
  const [title, setTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setError('Please select a JPG or PNG image')
      return
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile || !title.trim()) {
      setError('Please provide a title and select an image')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Upload the binary file to the backend
      const response = await memeService.uploadMemeFile(title.trim(), selectedFile)

      if (response.success && response.data) {
        setSuccess(true)
        setTitle('')
        setSelectedFile(null)
        setPreview(null)
        
        // Navigate to the new meme dialog immediately
        // The leaderboard will handle fetching the meme
        if (response.data) {
          navigate(`/meme/${response.data.meme_id}`)
        }
      } else {
        setError('Failed to upload meme. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreview(null)
    setError('')
  }

  return (
    <div className="meme-upload">
      <h2>Upload Your Meme</h2>
      <p>Share your best memes with the community!</p>

      {success && (
        <div className="success-message">
          🎉 Meme uploaded successfully! It will appear in the leaderboard soon.
        </div>
      )}

      <form onSubmit={handleSubmit} className="upload-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Meme Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your meme a catchy title..."
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Select Image *</label>
          <div className="file-input-container">
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileSelect}
              className="file-input"
            />
            <label htmlFor="image" className="file-input-label">
              {selectedFile ? selectedFile.name : 'Choose JPG or PNG file (max 5MB)'}
            </label>
          </div>
        </div>

        {preview && (
          <div className="preview-container">
            <h4>Preview:</h4>
            <div className="image-preview">
              <img src={preview} alt="Preview" />
              <button type="button" onClick={removeFile} className="remove-btn">
                ✕ Remove
              </button>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || !selectedFile || !title.trim()}>
          {loading ? 'Uploading...' : 'Upload Meme'}
        </button>
      </form>
    </div>
  )
}

export default MemeUpload
