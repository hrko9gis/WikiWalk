import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import useGeosearch from '../hooks/useGeosearch'
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";

// Leafletのデフォルトアイコンの問題を修正
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// スケールバー用コンポーネント
const ScaleControl = () => {
  const map = useMap()
  useEffect(() => {
    L.control.scale().addTo(map)
  }, [map])
  return null
}

// 現在地ボタン用コンポーネント
const LocateButton = () => {
  const map = useMap()

  const handleClick = () => {
    map.locate({ setView: true, maxZoom: 16 })
  }

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-25 right-2.5 z-[1000] bg-white rounded-sm shadow-md px-2 py-2 text-sm hover:bg-gray-100 items-center border border-gray-400"
    >
      <span class="button-state state-unnamed-state unnamed-state-active"><span class="fas fa-map-marker-alt"></span></span>
    </button>
  )
}

// 地図イベントを処理するコンポーネント
const MapEventHandler = ({ onMapMove }) => {
  useMapEvents({
    moveend: (e) => {
      const map = e.target
      const center = map.getCenter()
      const bounds = map.getBounds()
      onMapMove(center, bounds)
    },
    zoomend: (e) => {
      const map = e.target
      const center = map.getCenter()
      const bounds = map.getBounds()
      onMapMove(center, bounds)
    }
  })
  return null
}

function FreehandControl() {
  const map = useMap();

  useEffect(() => {
    if (!map.pm) return;

    // フリーハンド描画モードを有効化
    map.pm.addControls({
      position: "topright",
      drawCircle: false,
      drawPolygon: false,
      drawMarker: false,
      drawPolyline: true,  // 通常のライン描画ボタン
      editMode: true,
      removalMode: true,
    });

    map.pm.setPathOptions({
      color: 'red',        // 線の色を赤に
      weight: 3,           // 線の太さ
      opacity: 1,          // 不透明度
    });

    map.pm.setGlobalOptions({ snappable: false });
    
    // フリーハンド（線）をマウス操作で描けるようにする
    map.on("pm:drawstart", (e) => {
      if (e.shape === "Line") {
        console.log("Line drawing started");
      }
    });

    map.on("pm:create", (e) => {
      const layer = e.layer;
      console.log("Drawn layer:", layer.toGeoJSON());
    });

  }, [map]);

  return null;
}

const Map = ({ onFacilityClick }) => {
  const [facilities, setFacilities] = useState([])
  const [isAutoSearch, setIsAutoSearch] = useState(true)
  const { searchNearby, loading, error } = useGeosearch()

  // 地図移動時の処理
  const handleMapMove = async (center, bounds) => {
    if (!isAutoSearch) return

    const radius = Math.min(
      center.distanceTo(bounds.getNorthEast()),
      10000 // 最大10km
    )

    try {
      const results = await searchNearby(center.lat, center.lng, radius, 120)
      
      // 結果をマーカー用のデータに変換
      const newFacilities = results.map((result, index) => ({
        id: `geo_${result.pageid || index}`,
        name: result.title,
        position: [result.lat, result.lon],
        wikipediaTitle: result.title,
        extract: result.extract,
        thumbnail: result.thumbnail,
        content_urls: result.content_urls,
        isGeoResult: true
      }))

      setFacilities(newFacilities)
    } catch (err) {
      console.error('Geosearch failed:', err)
    }
  }

  // 初期データの設定
  useEffect(() => {
    const initialSearch = async () => {
      try {
        const results = await searchNearby(34.653528, 135.386417, 10000, 120)
        
        const newFacilities = results.map((result, index) => ({
          id: `geo_${result.pageid || index}`,
          name: result.title,
          position: [result.lat, result.lon],
          wikipediaTitle: result.title,
          extract: result.extract,
          thumbnail: result.thumbnail,
          content_urls: result.content_urls,
          isGeoResult: true
        }))

        setFacilities(newFacilities)
      } catch (err) {
        console.error('Initial geosearch failed:', err)
      }
    }
    
    initialSearch()
  }, [isAutoSearch])

  const handleMarkerClick = (facility, e) => {
    // クリック位置を画面座標で取得
    const containerPoint = e.containerPoint
    onFacilityClick(facility, { x: containerPoint.x, y: containerPoint.y })
  }

  return (
    <div className="relative">
      <MapContainer
        center={[34.653528, 135.386417]}
        zoom={15}
        zoomControl={false}
        style={{ height: '100dvh', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl
          position="bottomright"
        />
        
        {isAutoSearch && (
          <MapEventHandler onMapMove={handleMapMove} />
        )}
        
        {facilities.map((facility) => (
          <Marker
            key={facility.id}
            position={facility.position}
            eventHandlers={{
              click: (e) => handleMarkerClick(facility, e)
            }}
          >
            <Popup>
              <div style={{ maxWidth: '250px' }}>
                <h3 className="font-bold">{facility.name}</h3>

                {/* サムネイル画像 */}
                {facility.thumbnail?.source && (
                  <img
                    src={facility.thumbnail.source}
                    alt={facility.name}
                    style={{ width: '100%', marginTop: '5px' }}
                  />
                )}

                {/* 説明文 */}
                {facility.extract && (
                  <p className="text-sm mt-1">{facility.extract}</p>
                )}

                {/* Wikipediaページリンク */}
                {facility.content_urls?.desktop?.page && (
                  <p className="mt-2">
                    <a
                      href={facility.content_urls.desktop.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Wikipediaで見る
                    </a>
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        <ScaleControl />
        <LocateButton />
        <FreehandControl />
      </MapContainer>
    </div>
  )
}

export default Map

