import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Resource } from '../lib/resources'

const COLORS: Record<Resource['kind'], string> = { exam: '#3D86D6', support: '#2F9E78', legal: '#E9A23B' }

function pin(r: Resource, n: number, active: boolean) {
  return L.divIcon({ className: '', iconSize: [34, 34], iconAnchor: [17, 34], tooltipAnchor: [0, -30], html: `<div class="pin ${active ? 'active' : ''}" style="background:${COLORS[r.kind]}"><span>${n}</span></div>` })
}

// Cadre la carte sur tous les points visibles, puis glisse doucement vers celui choisi.
function Camera({ items, target }: { items: Resource[]; target?: Resource }) {
  const map = useMap()
  useEffect(() => {
    const pts = items.filter((r) => r.lat && r.lng).map((r) => [r.lat!, r.lng!] as [number, number])
    if (pts.length) map.flyToBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 14, duration: 0.8 })
  }, [items, map])
  useEffect(() => {
    // On glisse vers le lieu choisi sans zoomer : tous les autres points restent visibles.
    if (target?.lat && target.lng) map.panTo([target.lat, target.lng], { animate: true, duration: 0.8, easeLinearity: 0.2 })
  }, [target, map])
  return null
}

export default function ResourceMap({ items, active, onSelect }: { items: Resource[]; active?: string; onSelect: (id: string) => void }) {
  const placed = items.filter((r) => r.lat && r.lng)
  return (
    <MapContainer
      center={[45.515, -73.58]}
      zoom={12}
      scrollWheelZoom
      zoomSnap={0.25}
      zoomDelta={0.5}
      wheelPxPerZoomLevel={90}
      wheelDebounceTime={20}
      inertia
      className="h-full w-full"
    >
      {/* Plan de rues standard OpenStreetMap : sans clé d'API, sans filigrane */}
      <TileLayer
        attribution='&copy; contributeurs OpenStreetMap'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {placed.map((r) => (
        <Marker key={r.id} position={[r.lat!, r.lng!]} icon={pin(r, items.indexOf(r) + 1, r.id === active)} zIndexOffset={r.id === active ? 1000 : 0} eventHandlers={{ click: () => onSelect(r.id) }}>
          <Tooltip direction="top" className="pin-label" opacity={1} permanent={r.id === active}>{r.name.split(',')[0].split(' (')[0]}</Tooltip>
        </Marker>
      ))}
      <Camera items={items} target={items.find((r) => r.id === active)} />
    </MapContainer>
  )
}
