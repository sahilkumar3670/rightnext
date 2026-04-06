"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// For MVP, if icons are missing from public/leaflet, use manual CDN URLs:
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function MapPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);

  // Hook to get user's current exact location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition({ lat, lng });
          onLocationSelect(lat, lng);
        },
        () => {
          // Default to New Delhi fallback if user rejects location permission
          setPosition({ lat: 28.6139, lng: 77.2090 }); 
        }
      );
    }
  }, []);

  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
        map.flyTo(e.latlng, map.getZoom());
      },
      locationfound(e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      },
    });

    return position === null ? null : (
      <Marker position={position} icon={customIcon}></Marker>
    );
  }

  if (!position) return <div className="h-64 flex items-center justify-center bg-zinc-100 rounded-xl dark:bg-zinc-800 text-sm text-zinc-500">Detecting location...</div>

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700">
      <MapContainer 
        center={position} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}
