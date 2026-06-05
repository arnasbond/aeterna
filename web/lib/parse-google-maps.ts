function coordsFromPair(a: string, b: string): { lat: number; lng: number } | null {
  const lat = Number(a);
  const lng = Number(b);
  if (validLatLng(lat, lng)) return { lat, lng };
  return null;
}

/** Iš Google Maps nuorodos arba „lat, lng“ teksto ištraukia koordinates. */
export function parseGoogleMapsCoords(input: string): { lat: number; lng: number } | null {
  const raw = input.trim();
  if (!raw) return null;

  const plainPair = raw.match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/);
  if (plainPair) return coordsFromPair(plainPair[1]!, plainPair[2]!);

  const atAnywhere = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atAnywhere) return coordsFromPair(atAnywhere[1]!, atAnywhere[2]!);

  const d3d4 = raw.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (d3d4) return coordsFromPair(d3d4[1]!, d3d4[2]!);

  const d4d3 = raw.match(/!4d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/);
  if (d4d3) return coordsFromPair(d4d3[2]!, d4d3[1]!);

  const dest = raw.match(/destination=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (dest) return coordsFromPair(dest[1]!, dest[2]!);

  const center = raw.match(/center=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (center) return coordsFromPair(center[1]!, center[2]!);

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const q = url.searchParams.get("q") ?? url.searchParams.get("query") ?? url.searchParams.get("ll");
  if (q) {
    const qPair = q.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (qPair) return coordsFromPair(qPair[1]!, qPair[2]!);
  }

  return null;
}

function validLatLng(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function googleMapsPickUrl(query?: string): string {
  if (query?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
  }
  return "https://www.google.com/maps";
}
