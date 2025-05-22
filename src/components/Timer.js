import "../styles/Timer.css"

function Timer({ timeRemaining }) {
  // Convert seconds to minutes and seconds
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  // Format the time as MM:SS
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  return (
    <div className="timer-container">
      <div className="timer-display">{formattedTime}</div>
      <div className="timer-progress">
        <div className="timer-progress-bar" style={{ width: `${100 - (timeRemaining / (15 * 60)) * 100}%` }}></div>
      </div>
    </div>
  )
}

export default Timer
