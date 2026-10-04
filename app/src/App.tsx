import { useEffect, useState } from 'react'
import Landing from './components/Landing'
import Demo from './components/Demo'

// Routage par ancre (#/demo) : fonctionne tel quel sur GitHub Pages.
export default function App() {
  const [route, setRoute] = useState(window.location.hash)
  useEffect(() => {
    const on = () => {
      setRoute(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route.startsWith('#/demo') ? <Demo /> : <Landing />
}
