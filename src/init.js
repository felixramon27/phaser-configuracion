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
  
  const config = {
    width: 500,
    height: 500,
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
  
  let kinematic; // Variable global para el objeto Kinematic
  
  function preload() {
    this.load.spritesheet("red", "assets/red.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  
    this.load.image("ice", "assets/ice.png");
    this.load.image("campo", "assets/campo.webp");
  }
  
  function create() {
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
    
    this.add.image(0, 0, "campo").setScale(1);
    this.add.tileSprite(0, 0, 5000, 5000, "ice");
    this.red = this.add.sprite(50, 200, "red").setScale(1).setOrigin(0, 1);
  
    this.keys = this.input.keyboard.createCursorKeys();
  
    // Inicializa el objeto Kinematic
    kinematic = new Kinematic(
      new Phaser.Math.Vector2(this.red.x, this.red.y), // Posición inicial
      new Phaser.Math.Vector2(0, 0), // Velocidad inicial
      0, // Orientación inicial
      0 // Rotación inicial
    );
  }
  
  function update(time, delta) {
    const steering = new SteeringOutput(); // Crea un nuevo SteeringOutput
    steering.linear.set(0, 0); // Reinicia la fuerza lineal en cada actualización
  
    // Asigna movimiento basado en las teclas
    if (this.keys.up.isDown) {
      steering.linear.y = -200; // Velocidad hacia arriba
      this.red.anims.play("red-walk-up", true);
    } else if (this.keys.down.isDown) {
      steering.linear.y = 200; // Velocidad hacia abajo
      this.red.anims.play("red-walk-down", true);
    } else if (this.keys.left.isDown) {
      steering.linear.x = -200; // Velocidad hacia la izquierda
      this.red.anims.play("red-walk-left", true);
    } else if (this.keys.right.isDown) {
      steering.linear.x = 200; // Velocidad hacia la derecha
      this.red.anims.play("red-walk-right", true);
    } else {
      this.red.anims.play("red-idle", true);
    }
  
    // Actualiza el objeto Kinematic
    kinematic.update(steering, delta / 1000); // delta en segundos
  
    // Actualiza la posición del sprite
    this.red.x = kinematic.position.x;
    this.red.y = kinematic.position.y;
  }
  