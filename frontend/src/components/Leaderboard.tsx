import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { memeService } from '../services'
import { Meme } from '../types/api'
import MemeDialog from './MemeDialog'
import API_CONFIG from '../config/api'
import './Leaderboard.css'

interface LeaderboardProps {
  selectedMemeId?: string
}

function Leaderboard({ selectedMemeId }: LeaderboardProps) {
  const [memes, setMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadMemes()
  }, [])

  const loadMemes = async () => {
    try {
      const response = await memeService.getMemes()
      if (response.success && response.data) {
        // Backend returns data.memes
        const memesArray = response.data.memes
        // Take top 10 memes and sort by votes
        const topMemes = memesArray
          .sort((a: Meme, b: Meme) => b.votes - a.votes)
          .slice(0, 10)
        setMemes(topMemes)
      } else {
        setError('Failed to load memes')
      }
    } catch (err) {
      setError('Something went wrong while loading memes')
    } finally {
      setLoading(false)
    }
  }

  // Handle URL-based meme selection
  useEffect(() => {
    if (selectedMemeId) {
      if (memes.length > 0) {
        // Try to find meme in loaded memes first
        const meme = memes.find(m => m.meme_id === selectedMemeId)
        if (meme) {
          setSelectedMeme(meme)
        } else {
          // If meme not found in leaderboard, fetch it individually
          loadSingleMeme(selectedMemeId)
        }
      } else if (!loading) {
        // If memes are loaded but empty, try to fetch the individual meme
        loadSingleMeme(selectedMemeId)
      }
      // If still loading, wait for memes to load and this effect will run again
    } else {
      // No selectedMemeId, close dialog
      setSelectedMeme(null)
    }
  }, [selectedMemeId, memes, loading])

  const loadSingleMeme = async (memeId: string) => {
    console.log('Loading single meme:', memeId)
    try {
      const response = await memeService.getMeme(memeId)
      console.log('Single meme response:', response)
      if (response.success && response.data) {
        setSelectedMeme(response.data)
        console.log('Set selected meme:', response.data)
      } else {
        console.error('Failed to load single meme, trying to refresh memes list:', response)
        // If single meme fetch fails, try refreshing the entire list
        // This might help if the meme was just uploaded
        await loadMemes()
      }
    } catch (err) {
      console.error('Failed to load meme:', err)
      // Try refreshing memes list as fallback
      await loadMemes()
    }
  }

  const handleMemeClick = (meme: Meme) => {
    setSelectedMeme(meme)
    navigate(`/meme/${meme.meme_id}`)
  }

  const handleCloseDialog = () => {
    setSelectedMeme(null)
    navigate('/')
  }

  const handleVoteUpdate = (updatedMeme: Meme) => {
    // Update the memes list for leaderboard display
    setMemes(prev => prev.map(meme => 
      meme.meme_id === updatedMeme.meme_id ? updatedMeme : meme
    ))
    // DON'T update selectedMeme - let the dialog manage its own state
    // The dialog already has the correct local state, updating it would cause conflicts
  }

  if (loading) {
    return (
      <div className="leaderboard-loading">
        <p>Loading top memes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="leaderboard-error">
        <p>❌ {error}</p>
        <button onClick={loadMemes} className="retry-btn">
          Try Again
        </button>
      </div>
    )
  }

  if (memes.length === 0) {
    return (
      <div className="leaderboard-empty">
        <p>🏆 No memes yet!</p>
        <p>Be the first to upload a meme!</p>
      </div>
    )
  }

  return (
    <>
      <div className="leaderboard">
        <div className="leaderboard-grid">
          {memes.map((meme, index) => (
            <div 
              key={meme.meme_id} 
              className="meme-card"
              onClick={() => handleMemeClick(meme)}
            >
              <div className="meme-rank">#{index + 1}</div>
              <div className="meme-image-container">
                <img 
                  src={`${API_CONFIG.BASE_URL}/a/meme/${meme.meme_id}`}
                  alt={meme.title}
                  className="meme-image"
                  onError={(e) => {
                    // Fallback for broken images
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
                  }}
                />
              </div>
              <div className="meme-info">
                <h4 className="meme-title">{meme.title}</h4>
                <p className="meme-author">by {meme.username}</p>
                <div className="meme-votes">
                  ⬆️ {meme.votes} votes
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMeme && (
        <MemeDialog 
          meme={selectedMeme}
          onClose={handleCloseDialog}
          onVoteUpdate={handleVoteUpdate}
        />
      )}
    </>
  )
}

export default Leaderboard
