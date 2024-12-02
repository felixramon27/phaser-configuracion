import { Kinematic } from "./classes/Kinematic.js";
import { Arrive } from "./classes/Arrive.js";
import { Flee } from "./classes/Flee.js";
import { Seek } from "./classes/Seek.js";
import drawPath from "./drawPath.js";
import createGraph from "./createGraph.js";
import pathfindDijkstra from "./pathfindDijkstra.js";
import pixelToGraphCoord from "./pixelToGraphCoord.js";

let collisionLayer;
let graphics;
let kinematicGreen, arriveBehavior, fleeBehavior, currentBehavior, seekBehavior; // Variables globales
let kinematicArceus,
  arriveBehavior2,
  fleeBehavior2,
  currentBehavior2,
  seekBehavior2; // Variables globales
let kinematicBlue,
  arriveBehavior3,
  fleeBehavior3,
  currentBehavior3,
  seekBehavior3; // Variables globales
let pathIndex = 0; // Índice actual en el camino
let pathIndex1 = 0; // Índice actual en el camino
let pathIndex2 = 0; // Índice actual en el camino
let pathNodes = []; // Nodos del camino
let pathNodes1 = []; // Nodos del camino
let pathNodes2 = []; // Nodos del camino
let grafo; // Grafo de la mapa
let path; // Ruta encontrada
let path1; // Ruta encontrada
let path2; // Ruta encontrada
let tileWidth;
let tileHeight;
let mapWidth;
let mapHeight;
let graphicsArceus;
let graphicsBlue;
let graphicsGreen;
let iniciar;

function generateRandomPosition(grafo) {
  // Suponiendo que `grafo` es un objeto donde las claves son las coordenadas
  const puntosExistentes = Object.keys(grafo); // Obtiene las coordenadas existentes
  const puntoAleatorio =
    puntosExistentes[Math.floor(Math.random() * puntosExistentes.length)];
  return puntoAleatorio;
}

function generatePathForCharacter(grafo, ultimoNodo) {
  console.log("🚀 ~ generatePathForCharacter ~ ultimoNodo:", ultimoNodo);
  let start, end;

  if (ultimoNodo) {
    start = ultimoNodo;
  } else {
    start = generateRandomPosition(grafo);
    console.log("🚀 ~ generatePathForCharacter ~ start:", start);
  }

  do {
    end = generateRandomPosition(grafo);
  } while (start === end); // Evitar que el inicio y el final sean iguales

  const path = pathfindDijkstra(grafo, start, end);
  return path;
}

let Inicio = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Inicio() {
    Phaser.Scene.call(this, { key: "Inicio" });
  },
  preload() {
    this.load.image("logo", "assets/logo.png");
    this.load.image("fondo", "assets/image.png");
    this.load.audio("musica", "assets/selecciondemenu.flac");
  },
  create() {
    let fondo = this.add.image(
      game.config.width / 2,
      game.config.height / 2,
      "fondo"
    );
    fondo.setOrigin(0.5);
    fondo.setScale(0.9);

    this.add
      .image(game.config.width / 2, game.config.height / 6, "logo")
      .setScale(0.5);

    let textoCabecera = this.add.text(
      game.config.width / 2,
      game.config.height / 3,
      "¡Bienvenido al Mundo Pokémon!",
      {
        fontSize: "50px",
        fill: "#ffcc00",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 8,
      }
    );
    textoCabecera.setOrigin(0.5);

    let consejoTexto = this.add
      .text(
        game.config.width / 2,
        game.config.height - 50,
        "Presiona ENTER para iniciar",
        {
          fontSize: "20px",
          fill: "#ffffff",
        }
      )
      .setOrigin(0.5);

    let texto = this.add.text(
      game.config.width / 2,
      game.config.height / 2,
      "Iniciar",
      {
        fontSize: "40px",
        fill: "#ffffff",
        stroke: "#FF0000",
        strokeThickness: 6,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#FF0000",
          blur: 2,
          fill: true,
        },
      }
    );
    let clickSound = this.sound.add("musica");
    texto.setOrigin(0.5);
    texto.setInteractive();
    texto.on("pointerover", () => {
      texto.setStyle({ fill: "#ffcc00" });
    });
    texto.on("pointerout", () => {
      texto.setStyle({ fill: "#ffffff" });
    });

    texto.on("pointerdown", () => {
      clickSound.play();
      this.cameras.main.fadeOut(500);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("Principal");
      });
    });

    let efecto = this.tweens.add({
      targets: texto,
      y: game.config.height / 2 + 10,
      duration: 800,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    iniciar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    iniciar.reset();
  },

  update() {
    if (iniciar.isDown) {
      this.scene.start("Principal");
    }
  },
});

let Principal = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Principal() {
    Phaser.Scene.call(this, { key: "Principal" });
  },
  preload() {
    this.load.audio("musicaFondo", "assets/PokemonGym.mp3");

    this.load.spritesheet("vidas", "assets/vidas.png", {
      frameWidth: 300,
      frameHeight: 300,
    });

    this.load.spritesheet("red", "assets/red.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.spritesheet("green", "assets/green.png", {
      frameWidth: 48,
      frameHeight: 64,
    });

    this.load.spritesheet("arceus", "assets/arceus.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.spritesheet("blue", "assets/blue.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.image("tiles", "assets/tileset.png");
    this.load.tilemapTiledJSON("map", "assets/map.json");
  },

  create() {
    // Musica de fondo
    this.sound.add("musicaFondo", { loop: true }).play();

    // Cargar el mapa
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 64,
      tileHeight: 64,
    });

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
    graphicsArceus = this.add.graphics();
    graphicsBlue = this.add.graphics();
    graphicsGreen = this.add.graphics();
    graphics.lineStyle(1, 0xffffff, 0.5); // Color blanco, ligeramente transparente

    tileWidth = map.tileWidth;
    tileHeight = map.tileHeight;
    mapWidth = map.widthInPixels;
    mapHeight = map.heightInPixels;

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

    grafo = createGraph(collisionLayer);
    console.log("🚀 ~ create ~ grafo:", grafo);

    // path = pathfindDijkstra(grafo, "1,6", "20,16"); // Para kinematicGreen
    // path1 = pathfindDijkstra(grafo, "1,1", "11,15"); // Para kinematicArceus
    // path2 = pathfindDijkstra(grafo, "18,1", "22,18"); // Para kinematicBlue

    // Generar rutas para los personajes
    path = generatePathForCharacter(grafo);
    console.log("🚀 ~ create ~ path:", path);
    path1 = generatePathForCharacter(grafo);
    path2 = generatePathForCharacter(grafo);

    drawPath(graphicsGreen, path, map.tileWidth, map.tileHeight, 0xffff00);
    drawPath(graphicsArceus, path1, map.tileWidth, map.tileHeight, 0xffff00);
    drawPath(graphicsBlue, path2, map.tileWidth, map.tileHeight, 0xffff00);

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

    let textoVidaRed = this.add
      .text(game.config.width / 2, game.config.height / 2, "Vida de Red", {
        fontSize: "40px",
        fill: "#FF0000",
        stroke: "#FF0000",
        strokeThickness: 6,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000",
          blur: 2,
          fill: true,
        },
      })
      .setPosition(75, 100); // Cambiar posición

    this.vidas = this.add.sprite(
      game.config.width / 2,
      game.config.height / 2,
      "vidas"
    );

    this.vidas.setScale(0.3); // Reducir el tamaño al 30%
    this.vidas.setPosition(225, 180); // Cambiar posición

    // Animaciones de vidas
    // Animación de perder vida
    this.anims.create({
      key: "perderVida",
      frames: this.anims.generateFrameNumbers("vidas", { start: 0, end: 2 }),
      frameRate: 10,
      repeat: 0, // Se ejecuta una vez
    });

    // Animación de ganar vida (en reversa)
    this.anims.create({
      key: "ganarVida",
      frames: this.anims.generateFrameNumbers("vidas", { start: 2, end: 0 }),
      frameRate: 10,
      repeat: 0,
    });

    this.vidas.on("animationcomplete", (anim, frame) => {
      if (anim.key === "perderVida") {
        console.log("El personaje perdió una vida");
      } else if (anim.key === "ganarVida") {
        console.log("El personaje ganó una vida");
      }
    });

    let textoVidaBlue = this.add
      .text(game.config.width / 2, game.config.height / 2, "Vida de Blue", {
        fontSize: "40px",
        fill: "#0000ff",
        stroke: "#0000ff",
        strokeThickness: 6,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#fff",
          blur: 2,
          fill: true,
        },
      })
      .setPosition(1550, 100); // Cambiar posición

    this.vidasBlue = this.add.sprite(
      game.config.width / 2,
      game.config.height / 2,
      "vidas"
    );

    this.vidasBlue.setScale(0.3); // Reducir el tamaño al 30%
    this.vidasBlue.setPosition(1700, 180); // Cambiar posición

    // Animaciones de vidas
    // Animación de perder vida
    this.anims.create({
      key: "perderVidaBlue",
      frames: this.anims.generateFrameNumbers("vidas", { start: 0, end: 2 }),
      frameRate: 10,
      repeat: 0, // Se ejecuta una vez
    });

    // Animación de ganar vida (en reversa)
    this.anims.create({
      key: "ganarVidaBlue",
      frames: this.anims.generateFrameNumbers("vidas", { start: 2, end: 0 }),
      frameRate: 10,
      repeat: 0,
    });

    this.vidasBlue.on("animationcomplete", (anim, frame) => {
      if (anim.key === "perderVidaBlue") {
        console.log("El personaje perdió una vida");
      } else if (anim.key === "ganarVidaBlue") {
        console.log("El personaje ganó una vida");
      }
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

    this.anims.create({
      key: "arceus-walk-down",
      frames: this.anims.generateFrameNumbers("arceus", {
        start: 1,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "arceus-walk-up",
      frames: this.anims.generateFrameNumbers("arceus", {
        start: 12,
        end: 15,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "arceus-walk-right",
      frames: this.anims.generateFrameNumbers("arceus", {
        start: 8,
        end: 11,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "arceus-walk-left",
      frames: this.anims.generateFrameNumbers("arceus", {
        start: 4,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "arceus-idle",
      frames: [{ key: "arceus", frame: 0 }],
    });

    this.anims.create({
      key: "blue-walk-down",
      frames: this.anims.generateFrameNumbers("blue", {
        start: 1,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "blue-walk-up",
      frames: this.anims.generateFrameNumbers("blue", {
        start: 12,
        end: 15,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "blue-walk-right",
      frames: this.anims.generateFrameNumbers("blue", {
        start: 8,
        end: 11,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "blue-walk-left",
      frames: this.anims.generateFrameNumbers("blue", {
        start: 4,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "blue-idle",
      frames: [{ key: "blue", frame: 0 }],
    });

    this.red = this.physics.add
      .sprite(800, 400, "red")
      .setScale(1)
      .setOrigin(0.5, 0.5);

    // Agregar colisiones con el mapa
    this.physics.add.collider(this.red, layer);

    pathNodes = path.map((node) => {
      const [x, y] = node.node.split(",").map(Number);
      return {
        x: x * tileWidth + tileWidth / 2,
        y: y * tileHeight + tileHeight / 2,
      };
    });

    pathNodes1 = path1.map((node) => {
      const [x, y] = node.node.split(",").map(Number);
      return {
        x: x * tileWidth + tileWidth / 2,
        y: y * tileHeight + tileHeight / 2,
      };
    });

    pathNodes2 = path2.map((node) => {
      const [x, y] = node.node.split(",").map(Number);
      return {
        x: x * tileWidth + tileWidth / 2,
        y: y * tileHeight + tileHeight / 2,
      };
    });

    this.green = this.physics.add
      .sprite(pathNodes[0].x, pathNodes[0].y, "green")
      .setScale(1)
      .setOrigin(0.5, 0.5); // Agrega el sprite de green

    this.arceus = this.physics.add
      .sprite(pathNodes1[0].x, pathNodes1[0].y, "arceus")
      .setScale(1)
      .setOrigin(0.5, 0.5); // Agrega el sprite de arceus

    this.blue = this.physics.add
      .sprite(pathNodes2[0].x, pathNodes2[0].y, "blue")
      .setScale(1) // Agrega el sprite de blue
      .setOrigin(0.5, 0.5);

    this.cave = { x: 224, y: 1056 }; // Posición de la cueva
    this.houseGreen = { x: 224, y: 1056 }; // Posición de la casa de green

    this.greenStateMachine = new GreenStateMachine(
      this.green,
      this.red,
      this.houseGreen
    );

    this.arceusStateMachine = new ArceusStateMachine(
      this.arceus,
      this.red,
      this.cave
    );

    this.blueStateMachine = new BlueStateMachine(
      this.blue,
      this.red,
      this.gymBlue,
      this.arceus,
      this.vidasBlue,
      this.vidas,
    );

    // Agregar colisiones con el mapa green
    this.physics.add.collider(this.green, layer);
    this.physics.add.collider(this.arceus, layer);
    this.physics.add.collider(this.blue, layer);
    // Agregar colisiones con el personaje red
    // this.physics.add.overlap(this.red, this.arceus, () => {
    //   this.vidas.play("perderVida"); // Animación de pérdida de vida
    // });

    // this.physics.add.overlap(this.red, this.blue, () => {
    //   this.vidasBlue.play("perderVidaBlue"); // Animación de pérdida de vida
    // });

    this.physics.add.overlap(this.red, this.green, () => {
      this.vidas.play("ganarVida"); // Animación de ganar vida
    });
    // this.physics.add.collider(this.green, this.red);
    // this.physics.add.collider(this.arceus, this.red);
    // this.physics.add.collider(this.blue, this.red);

    this.keys = this.input.keyboard.createCursorKeys();

    // Inicializa el objeto Kinematic de green
    kinematicGreen = new Kinematic(
      new Phaser.Math.Vector2(this.green.x, this.green.y),
      new Phaser.Math.Vector2(0, 0),
      0,
      0
    );

    kinematicArceus = new Kinematic(
      new Phaser.Math.Vector2(this.arceus.x, this.arceus.y),
      new Phaser.Math.Vector2(0, 0),
      0,
      0
    );

    kinematicBlue = new Kinematic(
      new Phaser.Math.Vector2(this.blue.x, this.blue.y),
      new Phaser.Math.Vector2(0, 0),
      0,
      0
    );

    // Inicializa el comportamiento de Arrive para green siguiendo a red
    arriveBehavior = new Arrive(
      kinematicGreen,
      {
        position: new Phaser.Math.Vector2(
          pathNodes[pathIndex].x,
          pathNodes[pathIndex].y
        ),
      },
      100,
      200,
      10,
      100
    );

    arriveBehavior2 = new Arrive(
      kinematicArceus,
      {
        position: new Phaser.Math.Vector2(
          pathNodes1[pathIndex1].x,
          pathNodes1[pathIndex1].y
        ),
      },
      100,
      200,
      10,
      100
    );

    arriveBehavior3 = new Arrive(
      kinematicBlue,
      {
        position: new Phaser.Math.Vector2(
          pathNodes2[pathIndex2].x,
          pathNodes2[pathIndex2].y
        ),
      },
      100,
      200,
      10,
      100
    );

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

    // Inicializa el comportamiento actual como Arrive
    currentBehavior = arriveBehavior;
    currentBehavior2 = arriveBehavior2;
    currentBehavior3 = arriveBehavior3;
  },

  update(time, delta) {
    let lastFrame = 0; // Variable para guardar el último frame

    this.greenStateMachine.update(); // Actualiza el estado del Green
    this.arceusStateMachine.update(); // Actualiza el estado del Arceus
    this.blueStateMachine.update(); // Actualiza el estado del Blue

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
    // arriveBehavior.target.position.set(this.red.x, this.red.y);
    if (pathNodes && pathIndex < pathNodes.length) {
      const currentTarget = {
        position: new Phaser.Math.Vector2(
          pathNodes[pathIndex].x,
          pathNodes[pathIndex].y
        ),
      };
      arriveBehavior.target = currentTarget; // Asigna el nodo actual como el objetivo

      // Calcula la distancia entre `green` y el objetivo actual
      const distance = Phaser.Math.Distance.Between(
        kinematicGreen.position.x,
        kinematicGreen.position.y,
        currentTarget.position.x,
        currentTarget.position.y
      );

      // Si `green` ha llegado al objetivo, pasa al siguiente nodo
      if (distance < 10) {
        pathIndex++;
        if (pathIndex >= pathNodes.length - 1) {
          console.log("🚀 ~ update ~ pathNodes:", pathNodes);
          // `green` llegó al último nodo de la ruta anterior, genera una nueva ruta
          let lastNode = path[path.length - 1].node; // El último nodo alcanzado
          path = generatePathForCharacter(grafo, lastNode);
          console.log("🚀 ~ update ~ newPath:", path);
          pathIndex = 0; // Empieza desde el primer nodo de la nueva ruta

          // Mapea la nueva ruta
          pathNodes = path.map((node) => {
            const [x, y] = node.node.split(",").map(Number);
            return {
              x: x * tileWidth + tileWidth / 2,
              y: y * tileHeight + tileHeight / 2,
            };
          });

          // Dibuja la nueva ruta
          drawPath(graphicsGreen, path, tileWidth, tileHeight, 0xffff00);

          // Establece el primer nodo de la nueva ruta como el objetivo
          const currentTarget = {
            position: new Phaser.Math.Vector2(
              pathNodes[pathIndex].x,
              pathNodes[pathIndex].y
            ),
          };
          arriveBehavior.target = currentTarget; // Asigna el primer nodo de la nueva ruta como objetivo
        }
      }
    }

    if (pathNodes1 && pathIndex1 < pathNodes1.length) {
      const currentTarget = {
        position: new Phaser.Math.Vector2(
          pathNodes1[pathIndex1].x,
          pathNodes1[pathIndex1].y
        ),
      };
      arriveBehavior2.target = currentTarget; // Asigna el nodo actual como el objetivo

      // Calcula la distancia entre `green` y el objetivo actual
      const distance = Phaser.Math.Distance.Between(
        kinematicArceus.position.x,
        kinematicArceus.position.y,
        currentTarget.position.x,
        currentTarget.position.y
      );

      // Si `green` ha llegado al objetivo, pasa al siguiente nodo
      if (distance < 10) {
        pathIndex1++;
        if (pathIndex1 >= pathNodes1.length - 1) {
          console.log("🚀 ~ update ~ pathNodes:", pathNodes1);
          // `green` llegó al último nodo de la ruta anterior, genera una nueva ruta
          let lastNodeArceus = path1[path1.length - 1].node; // El último nodo alcanzado
          path1 = generatePathForCharacter(grafo, lastNodeArceus);
          console.log("🚀 ~ update ~ newPath:", path1);
          pathIndex1 = 0; // Empieza desde el primer nodo de la nueva ruta

          // Mapea la nueva ruta
          pathNodes1 = path1.map((node) => {
            const [x, y] = node.node.split(",").map(Number);
            return {
              x: x * tileWidth + tileWidth / 2,
              y: y * tileHeight + tileHeight / 2,
            };
          });

          // Dibuja la nueva ruta
          drawPath(graphicsArceus, path1, tileWidth, tileHeight, 0xffff00);

          // Establece el primer nodo de la nueva ruta como el objetivo
          const currentTarget = {
            position: new Phaser.Math.Vector2(
              pathNodes1[pathIndex1].x,
              pathNodes1[pathIndex1].y
            ),
          };
          arriveBehavior2.target = currentTarget; // Asigna el primer nodo de la nueva ruta como objetivo
        }
      }
    }

    if (pathNodes2 && pathIndex2 < pathNodes2.length) {
      const currentTarget = {
        position: new Phaser.Math.Vector2(
          pathNodes2[pathIndex2].x,
          pathNodes2[pathIndex2].y
        ),
      };
      arriveBehavior3.target = currentTarget; // Asigna el nodo actual como el objetivo

      // Calcula la distancia entre `green` y el objetivo actual
      const distance = Phaser.Math.Distance.Between(
        kinematicBlue.position.x,
        kinematicBlue.position.y,
        currentTarget.position.x,
        currentTarget.position.y
      );

      // Si `green` ha llegado al objetivo, pasa al siguiente nodo
      if (distance < 10) {
        pathIndex2++;
        if (pathIndex2 >= pathNodes2.length - 1) {
          console.log("🚀 ~ update ~ pathNodes:", pathNodes2);
          // `green` llegó al último nodo de la ruta anterior, genera una nueva ruta
          let lastNodeBlue = path2[path2.length - 1].node; // El último nodo alcanzado
          path2 = generatePathForCharacter(grafo, lastNodeBlue);
          console.log("🚀 ~ update ~ newPath:", path2);
          pathIndex2 = 0; // Empieza desde el primer nodo de la nueva ruta

          // Mapea la nueva ruta
          pathNodes2 = path2.map((node) => {
            const [x, y] = node.node.split(",").map(Number);
            return {
              x: x * tileWidth + tileWidth / 2,
              y: y * tileHeight + tileHeight / 2,
            };
          });

          // Dibuja la nueva ruta
          drawPath(graphicsBlue, path2, tileWidth, tileHeight, 0xffff00);

          // Establece el primer nodo de la nueva ruta como el objetivo
          const currentTarget = {
            position: new Phaser.Math.Vector2(
              pathNodes2[pathIndex2].x,
              pathNodes2[pathIndex2].y
            ),
          };
          arriveBehavior3.target = currentTarget; // Asigna el primer nodo de la nueva ruta como objetivo
        }
      }
    }

    fleeBehavior.target.position.set(this.red.x, this.red.y);
    seekBehavior.target.position.set(this.red.x, this.red.y);

    // Calcula el steering para "green" usando el comportamiento actual (Arrive, Flee o Wander)
    const steeringGreen = currentBehavior.getSteering();
    const steeringArceus = currentBehavior2.getSteering();
    const steeringBlue = currentBehavior3.getSteering();

    if (steeringArceus) {
      kinematicArceus.update(steeringArceus, delta / 1000);
      if (currentBehavior2 === arriveBehavior2) {
        this.arceus.x = kinematicArceus.position.x;
        this.arceus.y = kinematicArceus.position.y;
        const direction2 = new Phaser.Math.Vector2(
          this.arceus.x,
          this.arceus.y
        ).normalize();
        if (direction2.length() > 0) {
          // Determina la animación de "arceus" según la dirección
          if (Math.abs(direction2.x) > Math.abs(direction2.y)) {
            if (direction2.x > 0) {
              this.arceus.anims.play("arceus-walk-right", true);
            } else {
              this.arceus.anims.play("arceus-walk-left", true);
            }
          } else {
            if (direction2.y > 0) {
              this.arceus.anims.play("arceus-walk-down", true);
            } else {
              this.arceus.anims.play("arceus-walk-up", true);
            }
          }
        } else {
          // Detiene la animación y la posición de "arceus" cuando alcanza a "red"
          this.arceus.anims.stop();
          this.arceus.setFrame(0); // O el último frame que desees mostrar
        }
      }
    }

    if (steeringBlue) {
      kinematicBlue.update(steeringBlue, delta / 1000);
      if (currentBehavior3 === arriveBehavior3) {
        this.blue.x = kinematicBlue.position.x;
        this.blue.y = kinematicBlue.position.y;
        const direction3 = new Phaser.Math.Vector2(
          this.blue.x,
          this.blue.y
        ).normalize();
        if (direction3.length() > 0) {
          // Determina la animación de "blue" según la dirección
          if (Math.abs(direction3.x) > Math.abs(direction3.y)) {
            if (direction3.x > 0) {
              this.blue.anims.play("blue-walk-right", true);
            } else {
              this.blue.anims.play("blue-walk-left", true);
            }
          } else {
            if (direction3.y > 0) {
              this.blue.anims.play("blue-walk-down", true);
            } else {
              this.blue.anims.play("blue-walk-up", true);
            }
          }
        } else {
          // Detiene la animación y la posición de "blue" cuando alcanza a "red"
          this.blue.anims.stop();
          this.blue.setFrame(0); // O el último frame que desees mostrar
        }
      }
    }

    if (steeringGreen) {
      kinematicGreen.update(steeringGreen, delta / 1000);
      if (currentBehavior === seekBehavior) {
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
      } else {
        // Actualiza la posición de "green"
        this.green.x = kinematicGreen.position.x;
        this.green.y = kinematicGreen.position.y;

        // Calcula la dirección en la que "green" se está moviendo con respecto a "red"
        const direction = new Phaser.Math.Vector2(
          this.green.x,
          this.green.y
        ).normalize();

        if (direction.length() > 0) {
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
  },
});

class ArceusStateMachine {
  constructor(arceus, red, cave, grafo, drawPath) {
    this.arceus = arceus;
    this.red = red;
    this.cave = cave;
    this.grafo = grafo;
    this.drawPath = drawPath;
    this.state = "patrol";
    this.detectionRadius = 100;

    // Inicializar estas propiedades correctamente
    this.pathNodes1 = []; // Lista de nodos del camino actual
    this.pathIndexCurrent = 0; // Índice del nodo actual en el camino
    this.invisibleTimer = null; // Temporizador para la invisibilidad
    this.invisibleDuration = 8000; // Tiempo de invisibilidad (8 segundos)
  }

  update() {
    switch (this.state) {
      case "patrol":
        this.patrol();
        if (
          Phaser.Math.Distance.Between(
            this.arceus.x,
            this.arceus.y,
            this.red.x,
            this.red.y
          ) < this.detectionRadius
        ) {
          this.changeState("alert");
        }
        break;

      case "alert":
        this.alert();
        if (
          Phaser.Math.Distance.Between(
            this.arceus.x,
            this.arceus.y,
            this.red.x,
            this.red.y
          ) >= this.detectionRadius
        ) {
          this.changeState("escape");
        }
        break;

      case "escape":
        this.escape();
        break;
    }
  }

  changeState(newState) {
    this.state = newState;
    if (newState === "escape") {
      this.startEscape();
    }
  }

  patrol() {
    this.arceus.clearTint();
  }

  alert() {
    this.arceus.setTint(0xff0000);
  }

  reset() {
    path1 = generatePathForCharacter(grafo, "4,16");
    pathIndex1 = 0; // Empieza desde el primer nodo de la nueva ruta

    drawPath(graphicsArceus, path1, tileWidth, tileHeight, 0xffff00);
    pathNodes1 = path1.map((node) => {
      const [x, y] = node.node.split(",").map(Number);
      return {
        x: x * tileWidth + tileWidth / 2,
        y: y * tileHeight + tileHeight / 2,
      };
    });
    // Establece el primer nodo de la nueva ruta como el objetivo
    const currentTarget = {
      position: new Phaser.Math.Vector2(
        pathNodes1[pathIndex1].x,
        pathNodes1[pathIndex1].y
      ),
    };
    arriveBehavior2.target = currentTarget; // Asigna el primer nodo de la nueva ruta como objetivo
    return (this.state = "patrol"); // Vuelve a patrullar    ;
  }

  escape() {
    this.arceus.clearTint();

    if (this.pathNodes1 && this.pathIndexCurrent < this.pathNodes1.length) {
      const currentTarget = {
        position: new Phaser.Math.Vector2(
          this.pathNodes1[this.pathIndexCurrent].x,
          this.pathNodes1[this.pathIndexCurrent].y
        ),
      };
      arriveBehavior2.target = currentTarget;

      const distance = Phaser.Math.Distance.Between(
        kinematicArceus.position.x,
        kinematicArceus.position.y,
        currentTarget.position.x,
        currentTarget.position.y
      );

      if (distance < 10) {
        this.pathIndexCurrent++;
        if (this.pathIndexCurrent >= this.pathNodes1.length) {
          arriveBehavior2.target = null;
          this.arceus.setVisible(false);
          // Activar el temporizador para que vuelva después de 8 segundos
          if (this.invisibleTimer) {
            clearTimeout(this.invisibleTimer);
          }
          this.invisibleTimer = setTimeout(() => {
            this.arceus.setVisible(true); // El personaje se vuelve visible después de 3 segundos
            this.state = "reset"; // Vuelve a patrullar
            this.reset(); // Genera una nueva ruta aleatoria
            // Aquí, reseteamos la velocidad para asegurar que no haya velocidad inicial
            this.arceus.setVelocity(0, 0); // Restablece la velocidad
          }, this.invisibleDuration);
        }
      }
    }
  }

  calculatePath(destination) {
    let startGraphCoord = pixelToGraphCoord(
      this.arceus.x,
      this.arceus.y,
      tileWidth,
      tileHeight
    );
    let endGraphCoord = destination;
    let path = pathfindDijkstra(grafo, startGraphCoord, endGraphCoord);
    return path;
  }

  startEscape() {
    pathNodes1 = [];

    let newPath = this.calculatePath("4,16");
    this.pathNodes1 = newPath?.map((node) => {
      const [x, y] = node.node.split(",").map(Number);
      return {
        x: x * tileWidth + tileWidth / 2,
        y: y * tileHeight + tileHeight / 2,
      };
    });

    this.pathIndexCurrent = 0; // Reinicia el índice de camino
    drawPath(graphicsArceus, newPath, tileWidth, tileHeight, 0x8000ff);
  }
}

class GreenStateMachine {
  constructor(green, red, houseGreen, grafo, drawPath) {
    this.green = green;
    this.red = red;
    this.houseGreen = houseGreen;
    this.grafo = grafo;
    this.drawPath = drawPath;
    this.state = "patrol";
    this.detectionRadius = 100;

    // Inicializar estas propiedades correctamente
    this.pathNodes = []; // Lista de nodos del camino actual
    this.pathIndexCurrent = 0; // Índice del nodo actual en el camino
    this.invisibleTimer = null; // Temporizador para la invisibilidad
    this.invisibleDuration = 3000; // Tiempo de invisibilidad (3 segundos)
  }

  update() {
    switch (this.state) {
      case "patrol":
        this.patrol();
        if (
          Phaser.Math.Distance.Between(
            this.green.x,
            this.green.y,
            this.red.x,
            this.red.y
          ) < this.detectionRadius
        ) {
          this.changeState("alert");
        }
        break;

      case "alert":
        this.alert();
        if (
          Phaser.Math.Distance.Between(
            this.green.x,
            this.green.y,
            this.red.x,
            this.red.y
          ) >= this.detectionRadius
        ) {
          this.changeState("escape");
        }
        break;

      case "escape":
        this.escape();
        break;
    }
  }

  changeState(newState) {
    this.state = newState;
    if (newState === "escape") {
      this.startEscape();
    }
  }

  reset() {
    path = generatePathForCharacter(grafo, "6,2");
    pathIndex = 0; // Empieza desde el primer nodo de la nueva ruta

    drawPath(graphicsGreen, path, tileWidth, tileHeight, 0xffff00);
    pathNodes = path.map((node) => {
      const [x, y] = node.node.split(",").map(Number);
      return {
        x: x * tileWidth + tileWidth / 2,
        y: y * tileHeight + tileHeight / 2,
      };
    });
    // Establece el primer nodo de la nueva ruta como el objetivo
    const currentTarget = {
      position: new Phaser.Math.Vector2(
        pathNodes[pathIndex].x,
        pathNodes[pathIndex].y
      ),
    };
    arriveBehavior.target = currentTarget; // Asigna el primer nodo de la nueva ruta como objetivo
    return (this.state = "patrol"); // Vuelve a patrullar    ;
  }

  patrol() {
    this.green.clearTint();
  }

  alert() {
    this.green.setTint(0x008000);
  }

  escape() {
    this.green.clearTint();
    if (this.pathNodes && this.pathIndexCurrent < this.pathNodes.length) {
      const currentTarget = {
        position: new Phaser.Math.Vector2(
          this.pathNodes[this.pathIndexCurrent].x,
          this.pathNodes[this.pathIndexCurrent].y
        ),
      };
      arriveBehavior.target = currentTarget;

      const distance = Phaser.Math.Distance.Between(
        kinematicGreen.position.x,
        kinematicGreen.position.y,
        currentTarget.position.x,
        currentTarget.position.y
      );

      if (distance < 10) {
        this.pathIndexCurrent++;
        if (this.pathIndexCurrent >= this.pathNodes.length) {
          arriveBehavior.target = null;
          this.green.setVisible(false);
          // Activar el temporizador para que vuelva después de 3 segundos
          if (this.invisibleTimer) {
            clearTimeout(this.invisibleTimer);
          }
          this.invisibleTimer = setTimeout(() => {
            this.green.setVisible(true); // El personaje se vuelve visible después de 3 segundos
            this.state = "reset"; // Vuelve a patrullar
            this.reset(); // Genera una nueva ruta aleatoria
            // Aquí, reseteamos la velocidad para asegurar que no haya velocidad inicial
            this.green.setVelocity(0, 0); // Restablece la velocidad
          }, this.invisibleDuration);
        }
      }
    }
  }

  calculatePath(destination) {
    let startGraphCoord = pixelToGraphCoord(
      this.green.x,
      this.green.y,
      tileWidth,
      tileHeight
    );
    let endGraphCoord = destination;
    let path = pathfindDijkstra(grafo, startGraphCoord, endGraphCoord);
    return path;
  }

  startEscape() {
    pathNodes = [];

    let newPath = this.calculatePath("6,1");
    this.pathNodes = newPath?.map((node) => {
      const [x, y] = node.node.split(",").map(Number);
      return {
        x: x * tileWidth + tileWidth / 2,
        y: y * tileHeight + tileHeight / 2,
      };
    });

    this.pathIndexCurrent = 0; // Reinicia el índice de camino
    drawPath(graphicsGreen, newPath, tileWidth, tileHeight, 0x8000ff);
  }
}

class BlueStateMachine {
  constructor(blue, red, gymBlue, arceus, vidasBlue, vidas, grafo, drawPath) {
    this.blue = blue;
    this.red = red;
    this.arceus = arceus;
    this.gymBlue = gymBlue;
    this.grafo = grafo;
    this.vidasBlue = vidasBlue;
    this.vidas = vidas;
    this.drawPath = drawPath;
    this.state = "patrol";
    this.detectionRadius = 100;

    // Inicializar estas propiedades correctamente
    this.pathNodes2 = []; // Lista de nodos del camino actual
    this.pathIndexCurrent = 0; // Índice del nodo actual en el camino
    this.invisibleTimer = null; // Temporizador para la invisibilidad
    this.invisibleDuration = 2000; // Tiempo de invisibilidad (2 segundos)
  }

  update() {
    switch (this.state) {
      case "patrol":
        this.patrol();
        if (
          Phaser.Math.Distance.Between(
            this.blue.x,
            this.blue.y,
            this.red.x,
            this.red.y
          ) < 200
        ) {
          pathIndex2 = 0; // Empieza desde el primer nodo de la nueva ruta
          pathNodes2 = [];
          path2 = [];
          graphicsBlue.clear(); // Limpia solo el gráfico pasado como parámetro
          const currentTarget = {
            position: new Phaser.Math.Vector2(this.red.x, this.red.y),
          };
          arriveBehavior3.target = currentTarget; // Asigna el nodo actual como el objetivo
          // arriveBehavior3.target.position.set(this.red.x, this.red.y);
        }

        if (
          Phaser.Math.Distance.Between(
            this.blue.x,
            this.blue.y,
            this.red.x,
            this.red.y
          ) < 50
        ) {
          this.vidas.play("perderVida");
        }

        if (
          Phaser.Math.Distance.Between(
            this.arceus.x,
            this.arceus.y,
            this.red.x,
            this.red.y
          ) < this.detectionRadius
        ) {
          this.changeState("alert");
        }
        break;

      case "alert":
        this.alert();

        if (
          Phaser.Math.Distance.Between(
            this.arceus.x,
            this.arceus.y,
            this.red.x,
            this.red.y
          ) >= this.detectionRadius
        ) {
          this.changeState("escape");
        }
        break;

      case "escape":
        this.escape();
        break;
    }
  }

  changeState(newState) {
    this.state = newState;
    if (newState === "escape") {
      this.startEscape();
    }
  }

  reset() {
    path2 = generatePathForCharacter(grafo, "27,7");
    pathIndex2 = 0; // Empieza desde el primer nodo de la nueva ruta

    drawPath(graphicsBlue, path2, tileWidth, tileHeight, 0xffff00);
    pathNodes2 = path2.map((node) => {
      const [x, y] = node.node.split(",").map(Number);
      return {
        x: x * tileWidth + tileWidth / 2,
        y: y * tileHeight + tileHeight / 2,
      };
    });
    // Establece el primer nodo de la nueva ruta como el objetivo
    const currentTarget = {
      position: new Phaser.Math.Vector2(
        pathNodes2[pathIndex2].x,
        pathNodes2[pathIndex2].y
      ),
    };
    arriveBehavior3.target = currentTarget; // Asigna el primer nodo de la nueva ruta como objetivo
    return (this.state = "patrol"); // Vuelve a patrullar
  }

  patrol() {
    this.blue.clearTint();
  }

  alert() {
    this.blue.setTint(0x0000ff);
  }

  escape() {
    this.blue.clearTint();

    if (
      Phaser.Math.Distance.Between(
        this.blue.x,
        this.blue.y,
        this.red.x,
        this.red.y
      ) < this.detectionRadius
    ) {
      this.vidasBlue.play("perderVidaBlue");
    }

    if (this.pathNodes2 && this.pathIndexCurrent < this.pathNodes2.length) {
      const currentTarget = {
        position: new Phaser.Math.Vector2(
          this.pathNodes2[this.pathIndexCurrent].x,
          this.pathNodes2[this.pathIndexCurrent].y
        ),
      };
      arriveBehavior3.target = currentTarget;

      const distance = Phaser.Math.Distance.Between(
        kinematicBlue.position.x,
        kinematicBlue.position.y,
        currentTarget.position.x,
        currentTarget.position.y
      );

      if (distance < 10) {
        this.pathIndexCurrent++;
        if (this.pathIndexCurrent >= this.pathNodes2.length) {
          arriveBehavior3.target = null;
          this.blue.setVisible(false);
          this.vidasBlue.play("ganarVidaBlue");
          // Activar el temporizador para que vuelva después de 3 segundos
          if (this.invisibleTimer) {
            clearTimeout(this.invisibleTimer);
          }
          this.invisibleTimer = setTimeout(() => {
            this.blue.setVisible(true); // El personaje se vuelve visible después de 2 segundos
            this.state = "reset"; // Vuelve a patrullar
            this.reset(); // Genera una nueva ruta aleatoria
            // Aquí, reseteamos la velocidad para asegurar que no haya velocidad inicial
            this.blue.setVelocity(0, 0); // Restablece la velocidad
          }, this.invisibleDuration);
        }
      }
    }
  }

  calculatePath(destination) {
    let startGraphCoord = pixelToGraphCoord(
      this.blue.x,
      this.blue.y,
      tileWidth,
      tileHeight
    );
    let endGraphCoord = destination;
    let path = pathfindDijkstra(grafo, startGraphCoord, endGraphCoord);
    return path;
  }

  startEscape() {
    pathNodes2 = [];

    let newPath = this.calculatePath("27,7");
    this.pathNodes2 = newPath?.map((node) => {
      const [x, y] = node.node.split(",").map(Number);
      return {
        x: x * tileWidth + tileWidth / 2,
        y: y * tileHeight + tileHeight / 2,
      };
    });

    this.pathIndexCurrent = 0; // Reinicia el índice de camino
    drawPath(graphicsBlue, newPath, tileWidth, tileHeight, 0x8000ff);
  }
}

const config = {
  width: 1920,
  height: 1280,
  backgroundColor: "#000",
  parent: "container",
  type: Phaser.AUTO,
  physics: {
    default: "arcade", // Asegúrate de que este campo está presente
    arcade: {
      gravity: { y: 0 }, // Puedes cambiar la gravedad si lo necesitas
      debug: true, // Cambia a true si quieres ver las líneas de colisión y depuración
    },
  },
  scene: [Inicio, Principal],
};

const game = new Phaser.Game(config);
