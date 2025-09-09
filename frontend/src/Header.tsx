import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from './context/UserContext'
import './Header.css'

function Header() {
  const { user, logout } = useUser()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="home-button">
          <h1>MemeArena</h1>
        </Link>
        
        <div className="header-buttons">
          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="user-button"
              >
                Hello, {user.username}
              </button>
              {showDropdown && (
                <div className="dropdown">
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-button">
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
