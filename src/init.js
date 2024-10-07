import { Kinematic } from "./classes/Kinematic.js";
import { Arrive } from "./classes/Arrive.js";
import { KinematicArrive } from "./classes/KinematicArrive.js";
import { Flee } from "./classes/Flee.js";
import { Seek } from "./classes/Seek.js";
import { Wander } from "./classes/Wander.js";

const config = {
  width: 1480,
  height: 680,
  backgroundColor: "#0000",
  parent: "container",
  type: Phaser.AUTO,
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
  seekBehavior; // Variables globales
let redVelocity; // Variable para controlar el movimiento de "red"

function preload() {
  this.load.spritesheet("red", "assets/red.png", {
    frameWidth: 64,
    frameHeight: 64,
  });

  this.load.spritesheet("green", "assets/green.png", {
    frameWidth: 48,
    frameHeight: 64,
  });

  this.load.image("ice", "assets/ice.png");
  this.load.image("campo", "assets/campo.webp");

  this.load.image("button", "assets/button.png");
}

function create() {
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

  this.add.image(0, 0, "campo").setScale(1);
  this.add.tileSprite(0, 0, 5000, 5000, "ice");
  this.red = this.add.sprite(50, 200, "red").setScale(1).setOrigin(0, 1);
  this.green = this.add.sprite(100, 300, "green").setScale(1).setOrigin(0, 1); // Agrega el sprite de green

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

  // Inicializa el comportamiento de Arrive para green siguiendo a red
  arriveBehavior = new Arrive(
    kinematicGreen,
    { position: new Phaser.Math.Vector2(this.red.x, this.red.y) },
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
    200, // maxAcceleration
  );

  // Inicializa el Wander para movimientos erráticos
  wanderBehavior = new Wander(kinematicGreen, 200, 1); // 1 radian como rotación máxima

  // Inicializa la velocidad del personaje "red"
  redVelocity = new Phaser.Math.Vector2(0, 0);
  // Inicializa el comportamiento actual como Arrive
  currentBehavior = arriveBehavior;

  // Agregar botones para cambiar entre KinematicArriving y KinematicFlee
  // const buttonArrive = this.add.sprite(50, 150, "button").setInteractive();
  // const buttonFlee = this.add.sprite(50, 50, "button").setInteractive();

  const buttonKinematicArrive = this.add
    .rectangle(350, 50, 80, 30, 0xf00f0f)
    .setInteractive();
  const buttonArrive = this.add
    .rectangle(50, 50, 80, 30, 0x00ff00)
    .setInteractive();
  const buttonFlee = this.add
    .rectangle(150, 50, 80, 30, 0xff0000)
    .setInteractive();
  const buttonSeek = this.add
    .rectangle(450, 50, 80, 30, 0x0000ff)
    .setInteractive();
  const buttonWander = this.add
    .rectangle(250, 50, 80, 30, 0x0000ff)
    .setInteractive();

  buttonArrive.on("pointerdown", () => {
    currentBehavior = arriveBehavior; // Cambia el comportamiento a KinematicArriving
  });

  buttonFlee.on("pointerdown", () => {
    currentBehavior = fleeBehavior; // Cambia el comportamiento a KinematicFlee
  });

  buttonSeek.on("pointerdown", () => {
    currentBehavior = seekBehavior; // Cambia el comportamiento a KinematicFlee
  });

  buttonWander.on("pointerdown", () => {
    currentBehavior = wanderBehavior; // Cambia el comportamiento a KinematicWandering
  });

  buttonKinematicArrive.on("pointerdown", () => {
    currentBehavior = kinematicArrive; // Cambia el comportamiento a KinematicArr
  });

  // Estilo para los botones
  this.add.text(50 - 30, 50 - 10, "DArrive", {
    fontSize: "16px",
    fill: "#000",
  });
  this.add.text(150 - 20, 50 - 10, "DFlee", { fontSize: "16px", fill: "#000" });
  this.add.text(450 - 20, 50 - 10, "DSeek", { fontSize: "16px", fill: "#000" });
  this.add.text(250 - 30, 50 - 10, "KWander", {
    fontSize: "16px",
    fill: "#000",
  });
  this.add.text(350 - 30, 50 - 10, "KArrive", {
    fontSize: "16px",
    fill: "#000",
  });
}

function update(time, delta) {
  redVelocity.set(0, 0); // Reinicia la velocidad de "red"
  let lastFrame = 0; // Variable para guardar el último frame

  // Control manual para "red"
  if (this.keys.up.isDown) {
    redVelocity.y = -200;
    this.red.anims.play("red-walk-up", true);
    lastFrame = 12; // Último frame de la animación hacia arriba
  } else if (this.keys.down.isDown) {
    redVelocity.y = 200;
    this.red.anims.play("red-walk-down", true);
    lastFrame = 1; // Último frame de la animación hacia abajo
  } else if (this.keys.left.isDown) {
    redVelocity.x = -200;
    this.red.anims.play("red-walk-left", true);
    lastFrame = 4; // Último frame de la animación hacia la izquierda
  } else if (this.keys.right.isDown) {
    redVelocity.x = 200;
    this.red.anims.play("red-walk-right", true);
    lastFrame = 8; // Último frame de la animación hacia la derecha
  } else {
    this.red.anims.stop(); // Detenemos la animación
    // Solo establecer el último frame si se ha movido antes
    if (lastFrame > 0) {
      this.red.setFrame(lastFrame); // Establecemos el último frame
    }
  }

  // Mueve manualmente a "red"
  this.red.x += (redVelocity.x * delta) / 1000;
  this.red.y += (redVelocity.y * delta) / 1000;

  // Actualiza la posición de "red" en los comportamientos
  arriveBehavior.target.position.set(this.red.x, this.red.y);
  fleeBehavior.target.position.set(this.red.x, this.red.y);
  kinematicArrive.target.position.set(this.red.x, this.red.y);
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
    } else if (currentBehavior === kinematicArrive || currentBehavior === seekBehavior) {
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
