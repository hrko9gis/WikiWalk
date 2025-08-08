import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

export default function Map() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(
          'https://ja.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=35.6812|139.7671&gsradius=10000&gslimit=50&format=json&origin=*'
        );
        if (!response.ok) {
          throw new Error(`HTTPエラー: ${response.status}`);
        }
        const data = await response.json();
        if (data?.query?.geosearch) {
          setArticles(data.query.geosearch);
        } else {
          setError("データが取得できませんでした");
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {error && (
        <div style={{ background: "red", color: "white", padding: "8px" }}>
          エラー: {error}
        </div>
      )}
      <MapContainer center={[35.6812, 139.7671]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup>
          {articles.map((article) => (
            <Marker
              key={article.pageid}
              position={[article.lat, article.lon]}
              icon={defaultIcon}
            >
              <Popup>
                <strong>{article.title}</strong><br />
                <a href={`https://ja.wikipedia.org/?curid=${article.pageid}`} target="_blank" rel="noreferrer">
                  Wikipediaで見る
                </a>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
