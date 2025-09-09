import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './Header'
import Login from './Login'
import Home from './Home'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/meme/:id" element={
          <>
            <Header />
            <Home />
          </>
        } />
        <Route path="/" element={
          <>
            <Header />
            <Home />
          </>
        } />
      </Routes>
    </div>
  )
}

export default App
