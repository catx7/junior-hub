'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon (Leaflet's default icon paths break with bundlers)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMapProps {
  lat: number;
  lng: number;
  onPositionChange: (lat: number, lng: number) => void;
  height?: string;
}

function MapClickHandler({
  onPositionChange,
}: {
  onPositionChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prevPos = useRef({ lat, lng });

  useEffect(() => {
    // Only recenter if position changed significantly (from autocomplete selection)
    const dist = Math.abs(prevPos.current.lat - lat) + Math.abs(prevPos.current.lng - lng);
    if (dist > 0.001) {
      map.setView([lat, lng], map.getZoom());
      prevPos.current = { lat, lng };
    }
  }, [lat, lng, map]);

  return null;
}

export default function LocationMap({
  lat,
  lng,
  onPositionChange,
  height = '300px',
}: LocationMapProps) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-lg border">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[lat, lng]}
          icon={defaultIcon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const pos = marker.getLatLng();
              onPositionChange(pos.lat, pos.lng);
            },
          }}
        />
        <MapClickHandler onPositionChange={onPositionChange} />
        <MapCenterUpdater lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}
