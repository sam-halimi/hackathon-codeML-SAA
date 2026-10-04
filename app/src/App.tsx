import { lazy, Suspense, useEffect, useState } from 'react'
import Landing from './components/Landing'

const Demo = lazy(() => import('./components/Demo'))
const Espace = lazy(() => import('./components/Espace'))

// Routage par ancre : #/ accueil, #/espace espace personnel, #/demo outil soignant.
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
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      {route.startsWith('#/demo') ? <Demo /> : route.startsWith('#/espace') ? <Espace /> : <Landing />}
    </Suspense>
  )
}
