/** Geographic center of Lithuania — default map view when geo/IP is unavailable or abroad */
export const LT_MAP_DEFAULT = { lat: 55.1694, lng: 23.8813 } as const;

export const LT_MAP_DEFAULT_ZOOM = 7;

/** Approximate bounding box for Lithuania (includes border margin). */
export function isInLithuania(lat: number, lng: number): boolean {
  return lat >= 53.8 && lat <= 56.5 && lng >= 20.8 && lng <= 26.9;
}
