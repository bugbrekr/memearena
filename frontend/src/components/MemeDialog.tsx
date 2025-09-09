import { useState, useEffect } from 'react'
import { memeService } from '../services'
import { useUser } from '../context/UserContext'
import { Meme } from '../types/api'
import API_CONFIG from '../config/api'
import './MemeDialog.css'

interface MemeDialogProps {
  meme: Meme
  onClose: () => void
  onVoteUpdate: (updatedMeme: Meme) => void
}

function MemeDialog({ meme, onClose, onVoteUpdate }: MemeDialogProps) {
  const { user } = useUser()
  const [voting, setVoting] = useState(false)
  const [currentVote, setCurrentVote] = useState<boolean | null>(meme.user_vote)
  const [voteCount, setVoteCount] = useState(meme.votes)
  const [localMemeId, setLocalMemeId] = useState(meme.meme_id)
  const [copySuccess, setCopySuccess] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Only reset state when switching to a different meme
  useEffect(() => {
    if (meme.meme_id !== localMemeId) {
      setCurrentVote(meme.user_vote)
      setVoteCount(meme.votes)
      setLocalMemeId(meme.meme_id)
    }
  }, [meme.meme_id, meme.user_vote, meme.votes, localMemeId])

  const handleVote = async (upvote: boolean) => {
    if (!user || voting) return

    // Store previous state for potential rollback
    const previousVote = currentVote
    const previousCount = voteCount
    
    // Calculate new vote state and count
    let newVote: boolean | null
    let newCount: number
    
    if (currentVote === upvote) {
      // Clicking same button - remove vote
      newVote = null
      newCount = upvote ? voteCount - 1 : voteCount + 1
    } else if (currentVote === null) {
      // No previous vote - add vote
      newVote = upvote
      newCount = upvote ? voteCount + 1 : voteCount - 1
    } else {
      // Switching vote
      newVote = upvote
      newCount = upvote ? voteCount + 2 : voteCount - 2
    }
    
    // Update UI immediately and trust this state completely
    setCurrentVote(newVote)
    setVoteCount(newCount)

    setVoting(true)
    try {
      // clicked: true means we want to vote, false means we want to unvote
      const clicked = currentVote !== upvote
      
      const response = await memeService.voteMeme(meme.meme_id, upvote, clicked)
      
      if (response.success) {
        // Don't update local state from response - trust our local calculation
        // Only update the parent component for leaderboard refresh
        const updatedMeme = { ...meme, votes: newCount, user_vote: newVote }
        onVoteUpdate(updatedMeme)
      } else {
        // Only revert on API failure
        setCurrentVote(previousVote)
        setVoteCount(previousCount)
      }
    } catch (error) {
      console.error('Failed to vote:', error)
      // Only revert on API failure
      setCurrentVote(previousVote)
      setVoteCount(previousCount)
    } finally {
      setVoting(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      const memeUrl = `${window.location.origin}/meme/${meme.meme_id}`
      await navigator.clipboard.writeText(memeUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = `${window.location.origin}/meme/${meme.meme_id}`
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  const handleDelete = async () => {
    if (!user?.is_admin || deleting) return
    
    const confirmed = window.confirm('Are you sure you want to delete this meme? This action cannot be undone.')
    if (!confirmed) return

    setDeleting(true)
    try {
      const response = await memeService.deleteMeme(meme.meme_id)
      if (response.success) {
        // Close dialog and navigate back to home on successful deletion
        onClose()
      } else {
        alert('Failed to delete meme. Please try again.')
      }
    } catch (error) {
      console.error('Failed to delete meme:', error)
      alert('Failed to delete meme. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="meme-dialog-backdrop" onClick={handleBackdropClick}>
      <div className="meme-dialog">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
        
        <div className="dialog-content">
          <div className="meme-image-section">
            <img 
              src={`${API_CONFIG.BASE_URL}/a/meme/${meme.meme_id}`}
              alt={meme.title}
              className="dialog-meme-image"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
              }}
            />
          </div>
          
          <div className="meme-details-section">
            <div className="meme-header">
              <h2 className="dialog-meme-title">{meme.title}</h2>
              <p className="dialog-meme-author">by {meme.username}</p>
              {meme.description && (
                <p className="dialog-meme-description">{meme.description}</p>
              )}
            </div>
            
            <div className="vote-section">
              <div className="vote-count">
                <span className="vote-number">{voteCount}</span>
                <span className="vote-label">votes</span>
              </div>
              
              {user ? (
                <div className="vote-buttons">
                  <button
                    className={`vote-btn upvote ${currentVote === true ? 'active' : ''}`}
                    onClick={() => handleVote(true)}
                    disabled={voting}
                  >
                    ⬆️ Upvote
                  </button>
                  <button
                    className={`vote-btn downvote ${currentVote === false ? 'active' : ''}`}
                    onClick={() => handleVote(false)}
                    disabled={voting}
                  >
                    ⬇️ Downvote
                  </button>
                </div>
              ) : (
                <p className="login-prompt">
                  <a href="/login">Login</a> to vote on memes
                </p>
              )}
            </div>
            
            <div className="share-section">
              <button 
                className="copy-link-btn"
                onClick={handleCopyLink}
                title="Copy link to share this meme"
              >
                {copySuccess ? '✅ Copied!' : '🔗 Copy Link'}
              </button>
              
              {user?.is_admin && (
                <button 
                  className="delete-btn"
                  onClick={handleDelete}
                  disabled={deleting}
                  title="Delete this meme (Admin only)"
                >
                  {deleting ? '🗑️ Deleting...' : '🗑️ Delete'}
                </button>
              )}
            </div>
            
            {meme.created_at && (
              <div className="meme-meta">
                <p className="upload-date">
                  Uploaded {new Date(meme.created_at * 1000).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemeDialog
