export default function pixelToGraphCoord(x, y, tileWidth, tileHeight) {
  // Calcular la posición relativa en el grafo a partir de las coordenadas en píxeles
  let graphX = Math.floor(x / tileWidth);
  let graphY = Math.floor(y / tileHeight);

  return `${graphX},${graphY}`;
}
