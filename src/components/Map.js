"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useState } from "react"
import "../styles/Map.css"

// Fix missing marker icons in Leaflet + React setup
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function Map() {
  const [stores, setStores] = useState([])

  // Default map center (BINUS)
  const BINUS_LOCATION = [-6.201905, 106.781752]

  // Fetch store data from API (you can change the URL later)
  useEffect(() => {
    const fetchStores = async () => {
      try {
        // TODO: Replace with your actual API endpoint
        const response = await fetch("/api/stores")
        const data = await response.json()
        setStores(data)
      } catch (error) {
        console.error("Failed to fetch stores:", error)
      }
    }

    fetchStores()
  }, [])

  return (
    <MapContainer
      center={BINUS_LOCATION}
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Render store markers dynamically from API */}
      {stores.map((store, index) => (
        <Marker key={index} position={[store.lat, store.lng]}>
          <Popup>
            <strong>{store.name}</strong><br />
            {store.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default Map
