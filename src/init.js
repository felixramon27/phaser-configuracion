import { Kinematic } from "./classes/Kinematic.js";
import { Arrive } from "./classes/Arrive.js";
import { VelocityMatching } from "./classes/VelocityMatching.js";
import { KinematicArrive } from "./classes/KinematicArrive.js";
import { KinematicFlee } from "./classes/KinematicFlee.js";
import { Align } from "./classes/Align.js";
import { Flee } from "./classes/Flee.js";
import { Seek } from "./classes/Seek.js";
import { Wander } from "./classes/Wander.js";
import { Face } from "./classes/Face.js";
import { DynamicWander } from "./classes/DynamicWander.js";

let collisionLayer;
let graphics;

function createGraph(collisionLayer) {
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
            graph[key].push(neighborKey);
          }
        });
      }
    }
  }

  return graph;
}

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
      [this.items[index], this.items[parentIndex]] = [this.items[parentIndex], this.items[index]];
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

      if (left < length && this.items[left].priority < this.items[smallest].priority) {
        smallest = left;
      }
      if (right < length && this.items[right].priority < this.items[smallest].priority) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }
}


// Dijkstra's Pathfinding Algorithm
function pathfindDijkstra(graph, start, goal) {
  // Definición de NodeRecord
  class NodeRecord {
    constructor(node, connection, cost) {
      this.node = node;
      this.connection = connection;
      this.cost = cost;
    }
  }

  // Inicialización del registro para el nodo de inicio
  const startRecord = new NodeRecord(start, null, 0);

  // Inicialización de la cola de prioridad y la lista cerrada
  const open = new PriorityQueue();
  open.enqueue(startRecord, startRecord.cost);
  const closed = new Set();

  let current = null;

  // Ciclo principal
  while (!open.isEmpty()) {
    // Extraer el nodo con el menor costo de la cola de prioridad
    current = open.dequeue();

    // Verificar si hemos llegado al nodo objetivo
    if (current.node === goal) break;

    // Obtener las conexiones (vecinos) del nodo actual
    const connections = graph[current.node];

    // Iterar sobre cada conexión
    for (let next of connections) {
      const endNode = next.node;
      const endNodeCost = current.cost + next.cost;

      // Saltar si el nodo ya está en la lista cerrada
      if (closed.has(endNode)) continue;

      // Verificar si el nodo está en la cola abierta y si el nuevo camino es más caro
      const openRecord = open.items.find(record => record.item.node === endNode);
      if (openRecord) {
        if (openRecord.item.cost <= endNodeCost) continue;
        openRecord.item.cost = endNodeCost;
        openRecord.item.connection = current;
        open.bubbleUp(open.items.indexOf(openRecord));
      } else {
        // Crear un nuevo registro para el nodo no visitado
        const endNodeRecord = new NodeRecord(endNode, current, endNodeCost);
        open.enqueue(endNodeRecord, endNodeCost);
      }
    }

    // Añadir el nodo actual a la lista cerrada
    closed.add(current.node);
  }

  // Si no encontramos el objetivo, no hay solución
  if (current.node !== goal) return null;

  // Generar el camino en base a las conexiones
  const path = [];
  while (current.node !== start) {
    path.push(current.connection);
    current = current.connection;
  }

  // Invertir el camino para que vaya de inicio a fin
  return path.reverse();
}

function drawPath(graphics, path) {
  graphics.lineStyle(2, 0x0000ff); // Color azul para la ruta
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    const startX = start.x * tileWidth + tileWidth / 2;
    const startY = start.y * tileHeight + tileHeight / 2;
    const endX = end.x * tileWidth + tileWidth / 2;
    const endY = end.y * tileHeight + tileHeight / 2;

    graphics.moveTo(startX, startY);
    graphics.lineTo(endX, endY);
  }
}

const config = {
  width: 1920,
  height: 1280,
  // backgroundColor: "#008000",
  parent: "container",
  type: Phaser.AUTO,
  physics: {
    default: "arcade", // Asegúrate de que este campo está presente
    arcade: {
      gravity: { y: 0 }, // Puedes cambiar la gravedad si lo necesitas
      debug: true, // Cambia a true si quieres ver las líneas de colisión y depuración
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

let kinematicGreen,
  arriveBehavior,
  fleeBehavior,
  currentBehavior,
  wanderBehavior,
  kinematicArrive,
  seekBehavior,
  kinematicFlee,
  alignBehavior,
  velocityMatching,
  faceBehavior,
  dynamicWanderBehavior; // Variables globales

function preload() {
  this.load.spritesheet("red", "assets/red.png", {
    frameWidth: 64,
    frameHeight: 64,
  });

  this.load.spritesheet("green", "assets/green.png", {
    frameWidth: 48,
    frameHeight: 64,
  });

  this.load.image("tiles", "assets/tileset.png");
  this.load.tilemapTiledJSON("map", "assets/map.json");
}

function create() {
  // Cargar el mapa
  const map = this.make.tilemap({ key: "map", tileWidth: 64, tileHeight: 64 });

  // Agregar tileset
  const tileset = map.addTilesetImage("tiles1", "tiles");

  // Crear la capa de mapa
  const layer1 = map.createLayer("layer1", tileset, 0, 0);
  const layer2 = map.createLayer("layer2", tileset, 0, 0);
  const layer = map.createLayer("topLayer", tileset, 0, 0);
  // Configurar la capa de mapa
  layer.setCollisionBetween(0, 187);
  layer.setCollisionBetween(189, 747);

  // Dibujar la cuadrícula sobre el mapa
  graphics = this.add.graphics();
  graphics.lineStyle(1, 0xffffff, 0.5); // Color blanco, ligeramente transparente

  const tileWidth = map.tileWidth;
  const tileHeight = map.tileHeight;
  const mapWidth = map.widthInPixels;
  const mapHeight = map.heightInPixels;

  // Dibujar líneas verticales
  for (let x = 0; x <= mapWidth; x += tileWidth) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, mapHeight);
  }

  // Dibujar líneas horizontales
  for (let y = 0; y <= mapHeight; y += tileHeight) {
    graphics.moveTo(0, y);
    graphics.lineTo(mapWidth, y);
  }

  graphics.strokePath();

  collisionLayer = map.layers[2].data; // `mapData` es tu archivo `map.json`

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const isWalkable = collisionLayer[y][x].index === -1; // Determina si el tile es walkable

      const circleColor = isWalkable ? 0x00ff00 : 0xff0000; // Verde para transitable, rojo para no transitable
      const centerX = x * tileWidth + tileWidth / 2;
      const centerY = y * tileHeight + tileHeight / 2;

      graphics.fillStyle(circleColor, 0.5); // Ajusta la transparencia si lo deseas
      graphics.fillCircle(centerX, centerY, tileWidth / 10); // Ajusta el tamaño del círculo si es necesario
    }
  }

  const grafo = createGraph(collisionLayer);
  console.log("🚀 ~ create ~ grafo:", grafo);

  const graph = {
    "0,0": [
      { node: "0,1", cost: 1 },
      { node: "1,0", cost: 1 },
    ],
    "0,1": [
      { node: "0,0", cost: 1 },
      { node: "1,1", cost: 1 },
    ],
    "1,0": [
      { node: "0,0", cost: 1 },
      { node: "1,1", cost: 1 },
    ],
    "1,1": [
      { node: "0,1", cost: 1 },
      { node: "1,0", cost: 1 },
    ],
  };

  const path = pathfindDijkstra(graph, "0,0", "1,1");
  console.log(path);

  // Animaciones de red al caminar
  this.anims.create({
    key: "red-walk-down",
    frames: this.anims.generateFrameNumbers("red", {
      start: 1,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "red-walk-up",
    frames: this.anims.generateFrameNumbers("red", {
      start: 12,
      end: 15,
    }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "red-walk-right",
    frames: this.anims.generateFrameNumbers("red", {
      start: 8,
      end: 11,
    }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "red-walk-left",
    frames: this.anims.generateFrameNumbers("red", {
      start: 4,
      end: 7,
    }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "red-idle",
    frames: [{ key: "red", frame: 0 }],
  });
  // Animaciones de green al caminar
  this.anims.create({
    key: "green-walk-down",
    frames: this.anims.generateFrameNumbers("green", {
      start: 1,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "green-walk-up",
    frames: this.anims.generateFrameNumbers("green", {
      start: 12,
      end: 15,
    }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "green-walk-right",
    frames: this.anims.generateFrameNumbers("green", {
      start: 8,
      end: 11,
    }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "green-walk-left",
    frames: this.anims.generateFrameNumbers("green", {
      start: 4,
      end: 7,
    }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "green-idle",
    frames: [{ key: "green", frame: 0 }],
  });

  this.red = this.physics.add
    .sprite(700, 400, "red")
    .setScale(1)
    .setOrigin(0.5, 0.5);

  // Agregar colisiones con el mapa
  this.physics.add.collider(this.red, layer);

  this.green = this.physics.add
    .sprite(100, 400, "green")
    .setScale(1)
    .setOrigin(0.5, 0.5); // Agrega el sprite de green

  // Agregar colisiones con el mapa green
  this.physics.add.collider(this.green, layer);
  // Agregar colisiones con el personaje red
  this.physics.add.collider(this.green, this.red);

  this.keys = this.input.keyboard.createCursorKeys();

  // Inicializa el objeto Kinematic de green
  kinematicGreen = new Kinematic(
    new Phaser.Math.Vector2(this.green.x, this.green.y),
    new Phaser.Math.Vector2(0, 0),
    0,
    0
  );

  kinematicArrive = new KinematicArrive(
    kinematicGreen,
    { position: new Phaser.Math.Vector2(this.red.x, this.red.y) },
    200, // maxSpeed
    50, // Radio objetivo
    100 // Radio de desaceleración
  );

  kinematicFlee = new KinematicFlee(
    kinematicGreen,
    { position: new Phaser.Math.Vector2(this.red.x, this.red.y) },
    200 // maxSpeed
  );

  alignBehavior = new Align(
    kinematicGreen,
    { position: new Phaser.Math.Vector2(this.red.x, this.red.y) },
    0.05,
    Math.PI,
    0.01,
    Math.PI / 4,
    0.1
  );

  // Inicializa el comportamiento de Arrive para green siguiendo a red
  arriveBehavior = new Arrive(
    kinematicGreen,
    { position: new Phaser.Math.Vector2(this.red.x, this.red.y) },
    100,
    200,
    10,
    100
  );

  velocityMatching = new VelocityMatching(
    kinematicGreen,
    {
      position: new Phaser.Math.Vector2(this.red.x, this.red.y),
      velocity: new Phaser.Math.Vector2(this.red.x, this.red.y), // Nueva instancia de vector con los valores de redVelocity
    },
    100,
    200
  );

  faceBehavior = new Face(kinematicGreen, {
    position: new Phaser.Math.Vector2(this.red.x, this.red.y),
  });

  // Inicializa los comportamientos
  fleeBehavior = new Flee(
    kinematicGreen,
    { position: new Phaser.Math.Vector2(this.red.x, this.red.y) },
    200,
    150
  ); // 150 es la distancia segura

  // Inicializa los comportamientos
  seekBehavior = new Seek(
    kinematicGreen,
    { position: new Phaser.Math.Vector2(this.red.x, this.red.y) },
    200 // maxAcceleration
  );

  // Inicializa el Wander para movimientos erráticos
  wanderBehavior = new Wander(kinematicGreen, 50, 1); // 1 radian como rotación máxima

  // Inicializa el Wander dinámico
  dynamicWanderBehavior = new DynamicWander(kinematicGreen, 50, 1);

  // Inicializa el comportamiento actual como Arrive
  currentBehavior = arriveBehavior;
}

function update(time, delta) {
  let lastFrame = 0; // Variable para guardar el último frame

  // Control manual para "red"
  if (this.keys.up.isDown) {
    // redVelocity.set(0, -200); // Mueve hacia arriba
    this.red.setVelocityY(-200);
    this.red.anims.play("red-walk-up", true);
    lastFrame = 12; // Último frame de la animación hacia arriba
  } else if (this.keys.down.isDown) {
    // redVelocity.set(0, 200); // Mueve hacia abajo
    this.red.setVelocityY(200);
    this.red.anims.play("red-walk-down", true);
    lastFrame = 1; // Último frame de la animación hacia abajo
  } else if (this.keys.left.isDown) {
    // redVelocity.set(-200, 0); // Mueve hacia la izquierda'
    this.red.setVelocityX(-200);
    this.red.anims.play("red-walk-left", true);
    lastFrame = 4; // Último frame de la animación hacia la izquierda
  } else if (this.keys.right.isDown) {
    // redVelocity.set(200, 0); // Mueve hacia la derecha
    this.red.setVelocityX(200);
    this.red.anims.play("red-walk-right", true);
    lastFrame = 8; // Último frame de la animación hacia la derecha
  } else {
    // redVelocity.set(0, 0); // Detenemos la velocidad
    this.red.setVelocityX(0);
    this.red.setVelocityY(0);

    this.red.anims.stop(); // Detenemos la animación
    // Solo establecer el último frame si se ha movido antes
    if (lastFrame > 0) {
      this.red.setFrame(lastFrame); // Establecemos el último frame
    }
  }

  // Actualiza la posición de "red" en los comportamientos
  arriveBehavior.target.position.set(this.red.x, this.red.y);
  velocityMatching.target.position.set(this.red.x, this.red.y);
  fleeBehavior.target.position.set(this.red.x, this.red.y);
  kinematicArrive.target.position.set(this.red.x, this.red.y);
  kinematicFlee.target.position.set(this.red.x, this.red.y);
  faceBehavior.target.position.set(this.red.x, this.red.y);
  alignBehavior.target.orientation = Phaser.Math.Angle.Between(
    0,
    0,
    this.red.x,
    this.red.y
  );
  seekBehavior.target.position.set(this.red.x, this.red.y);

  // Calcula el steering para "green" usando el comportamiento actual (Arrive, Flee o Wander)
  const steeringGreen = currentBehavior.getSteering();
  if (steeringGreen) {
    kinematicGreen.update(steeringGreen, delta / 1000);

    if (currentBehavior === wanderBehavior) {
      // Actualiza la posición de green
      this.green.x = kinematicGreen.position.x;
      this.green.y = kinematicGreen.position.y;

      // Actualiza la orientación del sprite según la dirección de la velocidad
      let angle = Phaser.Math.RadToDeg(kinematicGreen.orientation);

      // Dependiendo del ángulo, selecciona la animación adecuada
      if (angle > -45 && angle <= 45) {
        this.green.anims.play("green-walk-right", true);
      } else if (angle > 45 && angle <= 135) {
        this.green.anims.play("green-walk-down", true);
      } else if (angle > 135 || angle <= -135) {
        this.green.anims.play("green-walk-left", true);
      } else {
        this.green.anims.play("green-walk-up", true);
      }
    } else if (currentBehavior === dynamicWanderBehavior) {
      // Actualizar todos los personajes green para que deambulen
      greenCharacters.forEach((greenCharacter) => {
        if (greenCharacter.dynamicWanderBehavior) {
          greenCharacter.dynamicWanderBehavior.getSteering(); // Actualiza el comportamiento DinamicWander
        }
      });
    } else if (currentBehavior === faceBehavior) {
      // Para cada personaje green, actualiza la rotación para mirar a red
      greenCharacters.forEach((green) => {
        const direction = new Phaser.Math.Vector2(
          this.red.x - green.x,
          this.red.y - green.y
        ).normalize();

        // Calcula el ángulo de rotación
        green.rotation = Phaser.Math.Angle.Between(
          green.x,
          green.y,
          this.red.x,
          this.red.y
        );

        // Aquí podrías establecer una animación fija, si lo deseas
        green.anims.play("green-idle", true); // Ejemplo de animación de "idle"
      });
    } else if (
      currentBehavior === kinematicArrive ||
      currentBehavior === seekBehavior ||
      currentBehavior === kinematicFlee
    ) {
      // Actualiza la posición de "green"
      this.green.x = kinematicGreen.position.x;
      this.green.y = kinematicGreen.position.y;

      // Ajusta la animación basándote en el movimiento
      if (steeringGreen.linear.length() > 0) {
        let angle = Phaser.Math.RadToDeg(kinematicGreen.orientation);
        if (angle > -45 && angle <= 45) {
          this.green.anims.play("green-walk-right", true);
        } else if (angle > 45 && angle <= 135) {
          this.green.anims.play("green-walk-down", true);
        } else if (angle > 135 || angle <= -135) {
          this.green.anims.play("green-walk-left", true);
        } else {
          this.green.anims.play("green-walk-up", true);
        }
      } else {
        this.green.anims.stop();
        this.green.setFrame(0); // O el último frame que desees mostrar
      }
    } else if (currentBehavior instanceof Align) {
      // Aplicar el steering al character 'green'
      // this.green.velocity.add(steeringGreen.linear); // Ajusta la velocidad
      this.green.rotation = steeringGreen.angular;
    } else {
      // Actualiza la posición de "green"
      this.green.x = kinematicGreen.position.x;
      this.green.y = kinematicGreen.position.y;

      // Calcula la dirección en la que "green" se está moviendo con respecto a "red"
      const direction = new Phaser.Math.Vector2(
        this.red.x - this.green.x,
        this.red.y - this.green.y
      ).normalize();

      // Verifica la distancia entre "red" y "green"
      const distance = Phaser.Math.Distance.Between(
        this.red.x,
        this.red.y,
        this.green.x,
        this.green.y
      );
      const stoppingDistance = 20; // Distancia para detener a "green"

      if (distance > stoppingDistance) {
        // Determina la animación de "green" según la dirección
        if (Math.abs(direction.x) > Math.abs(direction.y)) {
          if (direction.x > 0) {
            this.green.anims.play("green-walk-right", true);
          } else {
            this.green.anims.play("green-walk-left", true);
          }
        } else {
          if (direction.y > 0) {
            this.green.anims.play("green-walk-down", true);
          } else {
            this.green.anims.play("green-walk-up", true);
          }
        }
      } else {
        // Detiene la animación y la posición de "green" cuando alcanza a "red"
        this.green.anims.stop();
        this.green.setFrame(0); // O el último frame que desees mostrar
      }
    }
  }
}
