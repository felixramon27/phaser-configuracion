export class SteeringOutput {
  constructor() {
    this.linear = new Phaser.Math.Vector2(); // Para el movimiento
    this.angular = 0; // Para la rotación
  }
}
