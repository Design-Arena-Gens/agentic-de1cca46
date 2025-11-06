'use client';

import { useEffect, useRef, useState } from 'react';

type GeoCoordinates = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
};

type GeoState = {
  coordinates: GeoCoordinates | null;
  status: PermissionState | 'unsupported';
  error: string | null;
};

type PermissionState = 'prompt' | 'granted' | 'denied';

export function useGeolocation(enableHighAccuracy = true): GeoState {
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null);
  const [status, setStatus] = useState<GeoState['status']>('prompt');
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      setError('Geolocation is not supported by this browser.');
      return;
    }

    let cancelled = false;

    const handleSuccess = (position: GeolocationPosition) => {
      if (cancelled) return;
      setStatus('granted');
      const { latitude, longitude, accuracy, heading, speed } = position.coords;

      setCoordinates({
        latitude,
        longitude,
        accuracy: typeof accuracy === 'number' ? accuracy : null,
        heading:
          typeof heading === 'number' && !Number.isNaN(heading) ? heading : null,
        speed: typeof speed === 'number' && !Number.isNaN(speed) ? speed : null,
        timestamp: position.timestamp,
      });
    };

    const handleError = (geoError: GeolocationPositionError) => {
      if (cancelled) return;
      setStatus(
        geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'prompt',
      );
      setError(geoError.message);
    };

    try {
      watchId.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy,
          maximumAge: 1000,
          timeout: 10000,
        },
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Geolocation failed to initialize.',
      );
      setStatus('denied');
    }

    return () => {
      cancelled = true;
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [enableHighAccuracy]);

  return { coordinates, status, error };
}

