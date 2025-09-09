import { Link } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="home-button">
          <h1>MemeArena</h1>
        </Link>
        
        <div className="header-buttons">
          <Link to="/login" className="login-button">
            Login / Register
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
