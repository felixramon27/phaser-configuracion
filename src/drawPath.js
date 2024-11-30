export default function drawPath(graphics,path, tileWidth, tileHeight) {
    if (!path || path.length === 0) return;
  
    graphics.clear(); // Limpia solo el gráfico pasado como parámetro
  
    graphics.lineStyle(3, 0xffff00, 1); // Configura el estilo de la línea (color amarillo y grosor de 3)
  
    for (let i = 0; i < path.length - 1; i++) {
      const [x1, y1] = path[i].node.split(",").map(Number);
      const [x2, y2] = path[i + 1].node.split(",").map(Number);
  
      const startX = x1 * tileWidth + tileWidth / 2;
      const startY = y1 * tileHeight + tileHeight / 2;
      const endX = x2 * tileWidth + tileWidth / 2;
      const endY = y2 * tileHeight + tileHeight / 2;
  
      graphics.moveTo(startX, startY);
      graphics.lineTo(endX, endY);
    }
  
    graphics.strokePath(); // Dibuja la ruta en el mapa
  }
  