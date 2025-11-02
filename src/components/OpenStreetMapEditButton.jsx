import { useState, useEffect } from 'react'
import { useMapEvents } from 'react-leaflet'

export default function OpenStreetMapEditButton() {
  const [center, setCenter] = useState(null)
  const [zoom, setZoom] = useState(null)

  const map = useMapEvents({
    moveend: () => {
      setCenter(map.getCenter())
      setZoom(map.getZoom())
    }
  })

  useEffect(() => {
    setCenter(map.getCenter())
    setZoom(map.getZoom())
  }, [map])

  if (!center || zoom === null) return null

  const osmEditUrl = `https://www.openstreetmap.org/edit#map=${zoom}/${center.lat}/${center.lng}`

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '12px',
        right: '60px',
        zIndex: 1000,
        background: 'white',
        padding: '6px 10px',
        borderRadius: 6,
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        fontSize: '13px'
      }}
    >
      <a
        href={osmEditUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', color: '#0077cc' }}
      >
        OSM Edit
      </a>
    </div>
  )
}
