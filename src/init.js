class SteeringOutput {
  constructor() {
    this.linear = new Phaser.Math.Vector2(); // Para el movimiento
    this.angular = 0; // Para la rotación
  }
}

class Kinematic {
  constructor(position, velocity, orientation, rotation) {
    this.position = position; // Vector2
    this.velocity = velocity; // Vector2
    this.orientation = orientation; // Ángulo en radianes
    this.rotation = rotation; // Ángulo de rotación
  }

  update(steering, time) {
    // Actualiza la posición y orientación
    this.position.x += this.velocity.x * time;
    this.position.y += this.velocity.y * time;
    this.orientation += this.rotation * time;

    // Actualiza la velocidad y rotación
    this.velocity.x += steering.linear.x * time;
    this.velocity.y += steering.linear.y * time;
    this.rotation += steering.angular * time;
  }
}

class Arrive {
  constructor(
    character,
    target,
    maxAcceleration,
    maxSpeed,
    targetRadius,
    slowRadius
  ) {
    this.character = character;
    this.target = target;
    this.maxAcceleration = maxAcceleration;
    this.maxSpeed = maxSpeed;
    this.targetRadius = targetRadius;
    this.slowRadius = slowRadius;
    this.timeToTarget = 0.1;
  }

  getSteering() {
    let result = new SteeringOutput();

    let direction = this.target.position
      .clone()
      .subtract(this.character.position);
    let distance = direction.length();

    if (distance < this.targetRadius) {
      return null; // No hace falta movimiento
    }

    let targetSpeed =
      distance > this.slowRadius
        ? this.maxSpeed
        : this.maxSpeed * (distance / this.slowRadius);
    let targetVelocity = direction.normalize().scale(targetSpeed);

    result.linear = targetVelocity
      .subtract(this.character.velocity)
      .scale(1 / this.timeToTarget);

    if (result.linear.length() > this.maxAcceleration) {
      result.linear = result.linear.normalize().scale(this.maxAcceleration);
    }

    result.angular = 0;
    return result;
  }
}

class Seek {
  constructor(character, target, maxAcceleration) {
    this.character = character;
    this.target = target;
    this.maxAcceleration = maxAcceleration;
  }

  getSteering() {
    let result = new SteeringOutput();
    // Flee es lo opuesto a Seek, así que invertimos el signo
    result.linear = this.character.position
      .clone()
      .subtract(this.target.position);
    result.linear.normalize().scale(this.maxAcceleration);
    result.angular = 0;
    return result;
  }
}

class Flee {
  constructor(character, target, maxAcceleration, safeDistance) {
    this.character = character;
    this.target = target;
    this.maxAcceleration = maxAcceleration;
    this.safeDistance = safeDistance; // Distancia a la que deja de huir
  }

  getSteering() {
    let result = new SteeringOutput();
    let direction = this.character.position
      .clone()
      .subtract(this.target.position);
    let distance = direction.length();

    // Si la distancia es mayor que la distancia segura, no huir
    if (distance > this.safeDistance) {
      return null; // No hace falta movimiento
    }

    result.linear = direction.normalize().scale(this.maxAcceleration);
    result.angular = 0;
    return result;
  }
}

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

let kinematicGreen, arriveBehavior, fleeBehavior, currentBehavior; // Variables globales
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

  // Inicializa la velocidad del personaje "red"
  redVelocity = new Phaser.Math.Vector2(0, 0);
  // Inicializa el comportamiento actual como Arrive
  currentBehavior = arriveBehavior;

  // Agregar botones para cambiar entre KinematicArriving y KinematicFlee
  // const buttonArrive = this.add.sprite(50, 150, "button").setInteractive();
  // const buttonFlee = this.add.sprite(50, 50, "button").setInteractive();

  const buttonArrive = this.add
    .rectangle(50, 50, 80, 30, 0x00ff00)
    .setInteractive();
  const buttonFlee = this.add
    .rectangle(150, 50, 80, 30, 0xff0000)
    .setInteractive();

  buttonArrive.on("pointerdown", () => {
    currentBehavior = arriveBehavior; // Cambia el comportamiento a KinematicArriving
  });

  buttonFlee.on("pointerdown", () => {
    currentBehavior = fleeBehavior; // Cambia el comportamiento a KinematicFlee
  });

  // Estilo para los botones
  this.add.text(50 - 30, 50 - 10, "Arrive", { fontSize: "16px", fill: "#000" });
  this.add.text(150 - 20, 50 - 10, "Flee", { fontSize: "16px", fill: "#000" });
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

  // Calcula el steering para "green" usando el comportamiento de Arrive
  const steeringGreen = currentBehavior.getSteering();
  if (steeringGreen) {
    kinematicGreen.update(steeringGreen, delta / 1000);
  }

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
