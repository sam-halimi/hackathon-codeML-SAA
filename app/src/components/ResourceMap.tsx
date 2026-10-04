import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Resource } from '../lib/resources'

const COLORS: Record<Resource['kind'], string> = { exam: '#16181D', support: '#0F7A64', legal: '#A85A00' }

function pin(r: Resource, n: number, active: boolean) {
  return L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 30], html: `<div class="pin ${active ? 'active' : ''}" style="background:${COLORS[r.kind]}"><span>${n}</span></div>` })
}

function Fly({ target }: { target?: Resource }) {
  const map = useMap()
  useEffect(() => {
    if (target?.lat && target.lng) map.flyTo([target.lat, target.lng], 15, { duration: 0.9 })
  }, [target, map])
  return null
}

export default function ResourceMap({ items, active, onSelect }: { items: Resource[]; active?: string; onSelect: (id: string) => void }) {
  const placed = items.filter((r) => r.lat && r.lng)
  return (
    <MapContainer center={[45.515, -73.58]} zoom={12} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {placed.map((r) => (
        <Marker key={r.id} position={[r.lat!, r.lng!]} icon={pin(r, items.indexOf(r) + 1, r.id === active)} eventHandlers={{ click: () => onSelect(r.id) }} />
      ))}
      <Fly target={items.find((r) => r.id === active)} />
    </MapContainer>
  )
}
