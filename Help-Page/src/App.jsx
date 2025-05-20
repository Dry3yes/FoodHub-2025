import { useState } from 'react'
import './App.css'
import HelpContent from './components/HelpContent/HelpContent'
import Navbar from './components/Navbar/Navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <HelpContent />
    </>
  )
}

export default App
