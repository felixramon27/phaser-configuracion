class PriorityQueue {
  constructor() {
    this.items = [];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  // Insertar un nodo en la cola
  enqueue(item, priority) {
    this.items.push({ item, priority });
    this.bubbleUp(this.items.length - 1);
  }

  // Extraer el nodo con menor prioridad (menor costo)
  dequeue() {
    const min = this.items[0];
    const last = this.items.pop();
    if (!this.isEmpty()) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return min.item;
  }

  // Ajustar hacia arriba después de una inserción
  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.items[index].priority >= this.items[parentIndex].priority) break;
      [this.items[index], this.items[parentIndex]] = [
        this.items[parentIndex],
        this.items[index],
      ];
      index = parentIndex;
    }
  }

  // Ajustar hacia abajo después de una extracción
  bubbleDown(index) {
    const length = this.items.length;
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (
        left < length &&
        this.items[left].priority < this.items[smallest].priority
      ) {
        smallest = left;
      }
      if (
        right < length &&
        this.items[right].priority < this.items[smallest].priority
      ) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.items[index], this.items[smallest]] = [
        this.items[smallest],
        this.items[index],
      ];
      index = smallest;
    }
  }
}

// Dijkstra's Pathfinding Algorithm
export default function pathfindDijkstra(graph, start, goal, tacticalPoints) {
  class NodeRecord {
    constructor(node, connection, cost) {
      this.node = node;
      this.connection = connection;
      this.cost = cost;
    }
  }

  // Copiar el grafo para no modificar el original
  const graphCopy = JSON.parse(JSON.stringify(graph));

  // Eliminar nodos desventajosos del grafo
  if (tacticalPoints?.disadvantageous) {
    for (const disadvantageousNode of tacticalPoints.disadvantageous) {
      // Eliminar conexiones hacia y desde el nodo desventajoso
      if (graphCopy[disadvantageousNode]) {
        delete graphCopy[disadvantageousNode]; // Elimina el nodo desventajoso
      }

      for (const node in graphCopy) {
        if (graphCopy[node][disadvantageousNode]) {
          delete graphCopy[node][disadvantageousNode]; // Elimina conexiones hacia el nodo desventajoso
        }
      }
    }
  }

  const startRecord = new NodeRecord(start, null, 0);
  const open = new PriorityQueue();
  open.enqueue(startRecord, startRecord.cost);
  const closed = new Set();

  let current = null;

  while (!open.isEmpty()) {
    current = open.dequeue();

    if (current.node === goal) break;

    const connections = graph[current.node];

    // Asegurarse de que `connections` es un array antes de intentar iterar
    if (!Array.isArray(connections)) continue;

    for (let next of connections) {
      const endNode = next.node;
      const endNodeCost = current.cost + next.cost;

      if (closed.has(endNode)) continue;

      const openRecord = open.items.find(
        (record) => record.item.node === endNode
      );
      if (openRecord) {
        if (openRecord.item.cost <= endNodeCost) continue;
        openRecord.item.cost = endNodeCost;
        openRecord.item.connection = current;
        open.bubbleUp(open.items.indexOf(openRecord));
      } else {
        const endNodeRecord = new NodeRecord(endNode, current, endNodeCost);
        open.enqueue(endNodeRecord, endNodeCost);
      }
    }

    closed.add(current.node);
  }

  if (current.node !== goal) return null;

  const path = [];
  while (current.node !== start) {
    path.push(current.connection);
    current = current.connection;
  }

  return path.reverse();
}
