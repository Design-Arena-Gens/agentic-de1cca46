'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type PermissionState = 'prompt' | 'granted' | 'denied';

type CompassState = {
  heading: number | null;
  permission: PermissionState;
  isSupported: boolean;
  error: string | null;
  requestAccess: () => Promise<void>;
};

const normalizeHeading = (value: number) => {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

export function useCompass(): CompassState {
  const [heading, setHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const listenerRef = useRef<(event: DeviceOrientationEvent) => void>();

  const canRequestPermission =
    typeof window !== 'undefined' &&
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<PermissionState>;
    }).requestPermission === 'function';

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (!('DeviceOrientationEvent' in window)) {
      setIsSupported(false);
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let newHeading: number | null = null;

      const anyEvent = event as DeviceOrientationEvent & {
        webkitCompassHeading?: number;
        webkitCompassAccuracy?: number;
      };

      if (typeof anyEvent.webkitCompassHeading === 'number') {
        newHeading = anyEvent.webkitCompassHeading;
      } else if (typeof event.alpha === 'number') {
        if (event.absolute) {
          newHeading = 360 - event.alpha;
        } else {
          newHeading = 360 - event.alpha;
        }
      }

      if (newHeading !== null && !Number.isNaN(newHeading)) {
        setHeading(normalizeHeading(newHeading));
      }
    };

    listenerRef.current = handleOrientation;

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      listenerRef.current = undefined;
    };
  }, []);

  const stopListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (listenerRef.current) {
      window.removeEventListener('deviceorientation', listenerRef.current, true);
      listenerRef.current = undefined;
    }
  }, []);

  const requestAccess = useCallback(async () => {
    setError(null);
    try {
      if (canRequestPermission) {
        const result = await (
          DeviceOrientationEvent as typeof DeviceOrientationEvent & {
            requestPermission: () => Promise<PermissionState>;
          }
        ).requestPermission();

        setPermission(result);

        if (result !== 'granted') {
          stopListening();
          return;
        }
      } else {
        setPermission('granted');
      }

      startListening();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to access orientation sensors.',
      );
      setPermission('denied');
      stopListening();
    }
  }, [canRequestPermission, startListening, stopListening]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasSupport =
      'DeviceOrientationEvent' in window ||
      'ondeviceorientationabsolute' in window;

    setIsSupported(hasSupport);

    if (!hasSupport) {
      setPermission('denied');
      return;
    }

    if (!canRequestPermission) {
      setPermission('granted');
      startListening();
    }

    return () => {
      stopListening();
    };
  }, [canRequestPermission, startListening, stopListening]);

  return { heading, permission, isSupported, error, requestAccess };
}

