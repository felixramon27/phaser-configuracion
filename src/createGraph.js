export default function createGraph(collisionLayer) {
  const graph = {}; // Almacenará los nodos y sus conexiones

  for (let y = 0; y < collisionLayer.length; y++) {
    for (let x = 0; x < collisionLayer[y].length; x++) {
      const tile = collisionLayer[y][x];
      const isWalkable = tile.index === -1; // Determina si el tile es transitable

      if (isWalkable) {
        const key = `${x},${y}`; // Clave única para cada nodo (tile transitable)
        graph[key] = [];

        // Agrega conexiones con tiles adyacentes
        const neighbors = [
          { dx: 1, dy: 0 }, // Derecha
          { dx: -1, dy: 0 }, // Izquierda
          { dx: 0, dy: 1 }, // Abajo
          { dx: 0, dy: -1 }, // Arriba
        ];

        neighbors.forEach(({ dx, dy }) => {
          const nx = x + dx;
          const ny = y + dy;

          // Verificar si el vecino está dentro del mapa y es transitable
          if (
            ny >= 0 &&
            ny < collisionLayer.length &&
            nx >= 0 &&
            nx < collisionLayer[ny].length &&
            collisionLayer[ny][nx].index === -1
          ) {
            const neighborKey = `${nx},${ny}`;
            graph[key].push({ node: neighborKey, cost: 1 });
          }
        });
      }
    }
  }

  return graph;
}
