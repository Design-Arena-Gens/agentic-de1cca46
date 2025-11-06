'use client';

import { useMemo } from 'react';

import { useCompass } from '@/hooks/useCompass';
import { useGeolocation } from '@/hooks/useGeolocation';

const cardinalSegments = [
  'N',
  'NE',
  'E',
  'SE',
  'S',
  'SW',
  'W',
  'NW',
] as const;

const secondarySegments = [
  { label: 'N', angle: 0 },
  { label: 'E', angle: 90 },
  { label: 'S', angle: 180 },
  { label: 'W', angle: 270 },
];

const directionFromHeading = (heading: number | null) => {
  if (heading === null) return '---';
  const index = Math.round(heading / 45) % 8;
  return cardinalSegments[index];
};

export default function Home() {
  const { heading, permission, isSupported, error, requestAccess } =
    useCompass();
  const { coordinates, status: geoStatus, error: geoError } = useGeolocation();

  const isCompassReady = permission === 'granted' && heading !== null;
  const headingLabel = heading !== null ? `${Math.round(heading)}°` : '--°';

  const formattedCoords = useMemo(() => {
    if (!coordinates) return null;
    const { latitude, longitude, accuracy } = coordinates;
    return {
      latitude: latitude.toFixed(5),
      longitude: longitude.toFixed(5),
      accuracy: accuracy !== null ? Math.round(accuracy) : null,
    };
  }, [coordinates]);

  const geoStatusLabel = useMemo(() => {
    if (geoStatus === 'unsupported') return 'Not supported on this device';
    if (geoStatus === 'denied') return 'Access denied';
    if (geoStatus === 'prompt') return 'Awaiting permission';
    return 'Active';
  }, [geoStatus]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_55%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-14 sm:px-10 lg:flex-row lg:items-center lg:gap-16">
        <section className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-sky-100 sm:text-5xl">
              True North
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300">
              A sensor-powered compass that aligns to magnetic north using your
              device&apos;s orientation and GPS services. Grant access and move
              your device in a figure-eight to calibrate if readings drift.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur">
            <dl className="grid grid-cols-2 gap-4 text-sm text-slate-200 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-400">
                  Heading
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">
                  {headingLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-400">
                  Direction
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">
                  {directionFromHeading(heading)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-400">
                  Compass
                </dt>
                <dd className="mt-1 text-base font-medium text-slate-100">
                  {!isSupported
                    ? 'Orientation unavailable'
                    : permission === 'granted'
                      ? 'Active'
                      : permission === 'prompt'
                        ? 'Awaiting access'
                        : 'Permission denied'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-400">
                  GPS
                </dt>
                <dd className="mt-1 text-base font-medium text-slate-100">
                  {geoStatusLabel}
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-xs uppercase tracking-wider text-slate-400">
                  Latitude
                </dt>
                <dd className="mt-1 text-lg font-medium text-slate-100">
                  {formattedCoords ? formattedCoords.latitude : '—'}
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-xs uppercase tracking-wider text-slate-400">
                  Longitude
                </dt>
                <dd className="mt-1 text-lg font-medium text-slate-100">
                  {formattedCoords ? formattedCoords.longitude : '—'}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs uppercase tracking-wider text-slate-400">
                  Accuracy
                </dt>
                <dd className="mt-1 text-lg font-medium text-slate-100">
                  {formattedCoords && formattedCoords.accuracy !== null
                    ? `${formattedCoords.accuracy} m`
                    : '—'}
                </dd>
              </div>
            </dl>
          </div>

          {(permission !== 'granted' || error) && (
            <div className="space-y-3">
              {permission !== 'granted' && (
                <button
                  type="button"
                  onClick={() => requestAccess()}
                  className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold tracking-wide text-slate-950 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                >
                  Enable Compass Sensors
                </button>
              )}
              {error && (
                <p className="text-sm text-rose-300">Sensor error: {error}</p>
              )}
            </div>
          )}

          {geoError && (
            <p className="text-sm text-rose-300">GPS error: {geoError}</p>
          )}
        </section>

        <section className="flex flex-1 items-center justify-center">
          <div className="relative aspect-square w-full max-w-md">
            <div className="absolute inset-0 rounded-full border border-white/10 bg-slate-900/80 shadow-[0_30px_80px_-40px_rgba(56,189,248,0.5)] backdrop-blur">
              <div className="absolute inset-4 rounded-full border border-white/10" />
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                {secondarySegments.map(({ label, angle }) => (
                  <span
                    key={label}
                    className="absolute text-sm font-semibold text-slate-300"
                    style={{
                      transform: `rotate(${angle}deg) translateY(calc(-50% + 12px)) rotate(${-angle}deg)`,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="flex h-[70%] w-1 origin-bottom items-start justify-center rounded-full bg-gradient-to-b from-sky-400 via-sky-500 to-sky-900 shadow-[0_8px_24px_rgba(14,165,233,0.35)] transition-transform duration-300 ease-out"
                  style={{
                    transform: `rotate(${heading !== null ? -heading : 0}deg)`,
                  }}
                >
                  <div className="h-16 w-5 -translate-x-2 rounded-b-full bg-slate-900/90" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="pointer-events-none flex h-full w-full items-center justify-center">
                  <div
                    className="text-center text-lg font-semibold text-slate-100 transition-opacity"
                    style={{
                      opacity: isCompassReady ? 0 : 1,
                    }}
                  >
                    {permission === 'granted'
                      ? 'Move your device to calibrate'
                      : 'Tap enable to activate'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

