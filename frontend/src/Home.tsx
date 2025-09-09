import './Home.css'

function Home() {
  return (
    <main className="main-content">
      <section className="hero">
        <h2>Welcome to MemeArena</h2>
        <p>Where memes battle for supremacy</p>
        <p>Upload your memes and let the community decide who reigns supreme!</p>
      </section>

      <section className="leaderboard-section">
        <h3>Top Memes</h3>
        <div className="leaderboard-placeholder">
          <p>🏆 Leaderboard coming soon...</p>
          <p>The best memes will be displayed here!</p>
        </div>
      </section>
    </main>
  )
}

export default Home
