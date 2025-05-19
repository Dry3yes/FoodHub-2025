import "./App.css"
import Header from "./components/Header"
import Hero from "./components/Hero"
import Stats from "./components/Stats"
import HowItWorks from "./components/HowItWorks"
import AboutUs from "./components/AboutUs"
import Testimonials from "./components/Testimonials"
import Footer from "./components/Footer"

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <AboutUs />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

export default App
