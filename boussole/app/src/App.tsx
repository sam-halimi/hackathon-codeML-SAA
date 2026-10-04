import { lazy, Suspense, useEffect, useState } from 'react'
import Espace from './components/Espace'

const Demo = lazy(() => import('./components/Demo'))

// Routage par ancre : #/ espace de la personne (arrivée directe), #/demo outil soignant.
export default function App() {
  const [route, setRoute] = useState(window.location.hash)
  useEffect(() => {
    const on = () => { setRoute(window.location.hash); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return <Suspense fallback={<div className="min-h-screen" />}>{route.startsWith('#/demo') ? <Demo /> : <Espace />}</Suspense>
}
