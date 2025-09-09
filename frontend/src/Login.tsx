import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from './context/UserContext'
import { hashPassword } from './utils/crypto'
import './Login.css'

function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login, register } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Hash the password before sending
      const hashedPassword = await hashPassword(password)
      
      let success = false
      if (isLogin) {
        success = await login(username, hashedPassword)
        if (!success) {
          setError('Login failed. Please check your credentials.')
        }
      } else {
        success = await register(username, hashedPassword, email)
        if (!success) {
          setError('Registration failed. Username might already exist.')
        }
      }
      
      if (success) {
        navigate('/')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <Link to="/" className="back-button">← Back to Home</Link>
        
        <h1>MemeArena</h1>
        <p>Where memes battle for supremacy</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
          
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              className="link-button"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
