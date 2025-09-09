import { useParams } from 'react-router-dom'
import { useUser } from './context/UserContext'
import MemeUpload from './components/MemeUpload'
import Leaderboard from './components/Leaderboard'
import './Home.css'

function Home() {
  const { user } = useUser()
  const { id: memeId } = useParams<{ id?: string }>()

  return (
    <main className="main-content">
      <section className="leaderboard-section">
        <h3>Top Memes</h3>
        <Leaderboard selectedMemeId={memeId} />
      </section>

      {user ? (
        // Show upload form for logged-in users
        <MemeUpload />
      ) : (
        // Show welcome message for guests
        <section className="hero">
          <h2>Welcome to MemeArena</h2>
          <p>Where memes battle for supremacy</p>
          <p>Upload your memes and let the community decide who reigns supreme!</p>
          <p className="cta">Login or register to start uploading your memes!</p>
        </section>
      )}
    </main>
  )
}

export default Home
