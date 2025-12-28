import L from "leaflet";

export function createCustomIcon(category: string, isSelected: boolean, color: string) {
  let markerColor = color;

  if (isSelected) {
    markerColor = "#a855f7";
  }

  // Smaller size: 24x32 (approx 75% of original 32x42)
  const width = 24;
  const height = 32;
  const iconAnchorX = width / 2;
  const iconAnchorY = height;
  
  // Scale the path to fit the new viewbox or use transform
  // Original path was designed for 32x42.
  // We can keep the viewBox 0 0 32 42 and just change the width/height attributes of the SVG.
  
  const svgIcon = `
    <svg width="${width}" height="${height}" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">
      <path d="M16 0C9.373 0 4 5.373 4 12c0 9 12 28 12 28s12-19 12-28c0-6.627-5.373-12-12-12z" 
            fill="${markerColor}" 
            stroke="white" 
            stroke-width="2"/>
      <circle cx="16" cy="12" r="5" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: "custom-marker",
    iconSize: [width, height],
    iconAnchor: [iconAnchorX, iconAnchorY],
    popupAnchor: [0, -height],
  });
}
