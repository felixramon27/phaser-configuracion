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

let arrowVisible = false;
const greenCharacters = []; // Array para almacenar los personajes green

function createGreenCharacters() {
  // Eliminar personajes green existentes antes de crear nuevos
  greenCharacters.forEach((character) => character.destroy());
  greenCharacters.length = 0; // Limpiar el array

  const numCharacters = 5; // Número de personajes green
  const radius = 100; // Radio alrededor de red

  for (let i = 0; i < numCharacters; i++) {
    const angle = (i / numCharacters) * (Math.PI * 2); // Distribución en círculo
    const x = this.red.x + radius * Math.cos(angle);
    const y = this.red.y + radius * Math.sin(angle);

    const greenCharacter = this.physics.add
      .sprite(x, y, "green")
      .setScale(1)
      .setOrigin(0.5, 1); // Ajusta el origen si es necesario

    // Hacer que el personaje apunte hacia red
    alignArrowToRed(greenCharacter, this.red);

    // Agregar al array
    greenCharacters.push(greenCharacter);
  }
}

// Función para activar el comportamiento DinamicWander
function activateDynamicWander() {
  greenCharacters.forEach((greenCharacter) => {
    // Configura cada personaje green para deambular
    const dinamicWanderBehavior = new DynamicWander(greenCharacter, 100, 1); // Ajusta los parámetros según necesites
    greenCharacter.dinamicWander = dinamicWanderBehavior; // Almacena el comportamiento en el personaje
  });
}

function alignArrowToRed(arrow, red) {
  // Obtener la dirección hacia "red"
  const direction = new Phaser.Math.Vector2(red.x - arrow.x, red.y - arrow.y);

  // Normalizar la dirección
  direction.normalize();

  // Calcular la rotación deseada de la flecha
  const targetRotation = direction.angle();

  // Asegúrate de que la rotación actual de la flecha esté en el rango [-π, π]
  const currentRotation = arrow.rotation;

  // Ajustar la diferencia de rotación
  const rotationDifference = Phaser.Math.Angle.Normalize(
    currentRotation - targetRotation
  );

  // Define un límite para la rotación
  const maxRotationChange = 0.1; // Cambia esto para ajustar la velocidad de rotación
  if (Math.abs(rotationDifference) > maxRotationChange) {
    // Si la diferencia de rotación es mayor que el cambio máximo permitido,
    // ajusta la rotación hacia la dirección deseada
    arrow.rotation +=
      rotationDifference > 0 ? maxRotationChange : -maxRotationChange;
  } else {
    // Si la diferencia es menor, ajusta directamente a la rotación objetivo
    arrow.rotation = targetRotation;
  }
}

const config = {
  width: 1480,
  height: 680,
  backgroundColor: "#0000",
  parent: "container",
  type: Phaser.AUTO,
  physics: {
    default: "arcade", // Asegúrate de que este campo está presente
    arcade: {
      gravity: { y: 0 }, // Puedes cambiar la gravedad si lo necesitas
      debug: false, // Cambia a true si quieres ver las líneas de colisión y depuración
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

  this.load.image("arrow", "/assets/arrow.png");
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
  this.red = this.physics.add
    .sprite(700, 400, "red")
    .setScale(1)
    .setOrigin(0, 1);
  this.green = this.physics.add
    .sprite(100, 300, "green")
    .setScale(1)
    .setOrigin(0, 1); // Agrega el sprite de green
  this.arrow = this.physics.add
    .sprite(this.green.x, this.green.y, "arrow")
    .setScale(0.5)
    .setOrigin(0.5, 0.5); // Centrar la flecha en green
  this.arrow.rotation = 0; // Empezamos sin rotación

  // Crear 5 personajes green
  // for (let i = 0; i < 5; i++) {
  //   const greenCharacter = (this.green = this.physics.add
  //     .sprite(100, 300, "green")
  //     .setScale(1)
  //     .setOrigin(0, i)); // Agrega el sprite de green; // Asume que esta función crea y devuelve un personaje green
  //   greenCharacters.push(greenCharacter);
  // }

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
    { position: new Phaser.Math.Vector2(this.red.x, this.red.y) },
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
  const buttonKinematicFlee = this.add
    .rectangle(550, 50, 80, 30, 0xf00f0f)
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
  const buttonAlign = this.add
    .rectangle(650, 50, 80, 30, 0xf00f0f)
    .setInteractive();
  const buttonVelocity = this.add
    .rectangle(755, 50, 90, 30, 0xf00f0f)
    .setInteractive();
  const buttonFace = this.add
    .rectangle(850, 50, 90, 30, 0xf00f)
    .setInteractive();
  // const buttonDynamicWander = this.add
  //   .rectangle(1050, 50, 90, 30, 0xf00f)
  //   .setInteractive();

  buttonArrive.on("pointerdown", () => {
    currentBehavior = arriveBehavior; // Cambia el comportamiento
  });

  buttonFlee.on("pointerdown", () => {
    currentBehavior = fleeBehavior; // Cambia el comportamiento
  });

  buttonSeek.on("pointerdown", () => {
    currentBehavior = seekBehavior; // Cambia el comportamiento
  });

  buttonWander.on("pointerdown", () => {
    currentBehavior = wanderBehavior; // Cambia el comportamiento
  });

  buttonKinematicArrive.on("pointerdown", () => {
    currentBehavior = kinematicArrive; // Cambia el comportamiento
  });

  buttonKinematicFlee.on("pointerdown", () => {
    currentBehavior = kinematicFlee; // Cambia el comportamiento
  });
  buttonFace.on("pointerdown", () => {
    createGreenCharacters.call(this); // Llama a la función para crear personajes
    currentBehavior = faceBehavior; // Cambia el comportamiento
    // Asegúrate de que todos los green estén siguiendo la posición de red
    greenCharacters.forEach((greenCharacter) => {
      // Actualiza la posición del comportamiento
      faceBehavior.target.position.set(this.red.x, this.red.y);
      alignArrowToRed(greenCharacter, this.red); // Alinear flecha a red
      // Cambia el sprite según la dirección de red
      const direction = new Phaser.Math.Vector2(
        this.red.x - greenCharacter.x,
        this.red.y - greenCharacter.y
      ).normalize();
      if (direction.y < 0) {
        greenCharacter.anims.play("green-walk-up", true);
      } else if (direction.y > 0) {
        greenCharacter.anims.play("green-walk-down", true);
      } else if (direction.x < 0) {
        greenCharacter.anims.play("green-walk-left", true);
      } else {
        greenCharacter.anims.play("green-walk-right", true);
      }
    });
  });
  buttonAlign.on("pointerdown", () => {
    // se ve la fecha
    arrowVisible = true;
    // Ocultar a green
    this.green.setVisible(false);
    // Cambiar el comportamiento actual al de Align
    currentBehavior = alignBehavior;
    // Iniciar la rotación de la flecha hacia la dirección de red
    alignArrowToRed(this.arrow, this.red);
  });
  buttonVelocity.on("pointerdown", () => {
    currentBehavior = velocityMatching; // Cambia el comportamiento
  });
  // buttonDynamicWander.on("pointerdown", () => {
  //   createGreenCharacters.call(this); // Llama a la función para crear personajes
  //   currentBehavior = dynamicWanderBehavior; // Cambia el comportamiento
  //   activateDynamicWander(); // Activa el comportamiento DinamicWander
  // });

  // Botón para reiniciar el estado
  const buttonReset = this.add
    .rectangle(950, 50, 80, 30, 0xffff00)
    .setInteractive();
  buttonReset.on("pointerdown", () => {
    // Reinicia el estado de greenCharacters
    greenCharacters.forEach((character) => character.destroy());
    greenCharacters.length = 0; // Limpiar el array

    // Reinicia la posición y comportamiento de red
    this.red.setPosition(700, 400);
    // Elimina todos los personajes green creados
    greenCharacters.forEach((green) => green.destroy());
    greenCharacters.length = 0;

    redVelocity.set(0, 0);
    currentBehavior = arriveBehavior; // O cualquier comportamiento que desees inicializar
  });

  // Estilo para los botones
  this.add.text(50 - 30, 50 - 10, "DArrive", {
    fontSize: "16px",
    fill: "#000",
  });
  this.add.text(150 - 20, 50 - 10, "DFlee", { fontSize: "16px", fill: "#000" });
  this.add.text(250 - 30, 50 - 10, "KWander", {
    fontSize: "16px",
    fill: "#000",
  });
  this.add.text(350 - 30, 50 - 10, "KArrive", {
    fontSize: "16px",
    fill: "#000",
  });
  this.add.text(450 - 20, 50 - 10, "DSeek", { fontSize: "16px", fill: "#000" });
  this.add.text(550 - 30, 50 - 10, "KFlee", {
    fontSize: "16px",
    fill: "#000",
  });
  this.add.text(650 - 30, 50 - 10, "Align", {
    fontSize: "16px",
    fill: "#000",
  });
  this.add.text(750 - 30, 50 - 10, "Velocity", {
    fontSize: "16px",
    fill: "#000",
  });
  this.add.text(850 - 30, 50 - 10, "Face", {
    fontSize: "16px",
    fill: "#000",
  });
  this.add.text(950 - 30, 50 - 10, "Reset", {
    fontSize: "16px",
    fill: "#000",
  });
  // this.add.text(1050 - 30, 50 - 10, "DWander", {
  //   fontSize: "16px",
  //   fill: "#000",
  // });
}

function update(time, delta) {
  if (arrowVisible) {
    // Mostrar la flecha
    this.arrow.setVisible(true);
    this.green.setVisible(false);

    // Actualizar la posición de la flecha para que siga a "red"
    this.arrow.x = this.green.x;
    this.arrow.y = this.green.y;

    // Llamar a la función de alineación para rotar la flecha hacia "red"
    alignArrowToRed(this.arrow, this.red);
  } else {
    this.arrow.setVisible(false); // Mantener oculta si no es visible
    this.green.setVisible(true);
  }

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
  velocityMatching.target.position.set(this.red.x, this.red.y);
  fleeBehavior.target.position.set(this.red.x, this.red.y);
  kinematicArrive.target.position.set(this.red.x, this.red.y);
  kinematicFlee.target.position.set(this.red.x, this.red.y);
  faceBehavior.target.position.set(this.red.x, this.red.y);
  // alignBehavior.target.position.set(this.red.x, this.red.y);
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
