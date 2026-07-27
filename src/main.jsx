import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createLenis } from './lib/lenis'
import './styles/globals.css'
import App from './App.jsx'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

if (!prefersReducedMotion) {
  const lenis = createLenis({ duration: 0.7, smoothWheel: true })
  window.__lenis = lenis
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  // Proper lag smoothing: prevents frame jumps/freezing if CPU/GPU dips briefly
  gsap.ticker.lagSmoothing(1000, 16)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
