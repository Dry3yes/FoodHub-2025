"use client"

import { useState, useEffect } from "react"
import Timer from "./components/Timer"
import Map from "./components/Map"
import "./App.css"

function App() {
  const [timeRemaining, setTimeRemaining] = useState(15 * 60) // 15 minutes in seconds
  const [status, setStatus] = useState("Preparing")

  useEffect(() => {
    // Start the timer automatically
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          setStatus("Done")
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    // Clean up the interval on component unmount
    return () => clearInterval(timer)
  }, [])

  const handleBackClick = () => {
    // Handle back button click - you can implement navigation logic here
    alert("Back button clicked")
  }

  return (
    <div className="app-container">
      <div className="content-container">
        <h1 className="app-title">Meal Prep Timer</h1>

        <Timer timeRemaining={timeRemaining} />

        <div className="status-container">
          <div className="status-text">
            Status: <span className={status === "Done" ? "status-done" : "status-preparing"}>{status}</span>
          </div>
        </div>

        <div className="map-container">
          <Map />
        </div>

        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
      </div>
    </div>
  )
}

export default App
