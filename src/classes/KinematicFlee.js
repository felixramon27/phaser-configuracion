import { SteeringOutput } from './SteeringOutput.js';
//Esto hará que el personaje "green" huya del "red" continuamente cuando se ejecute el comportamiento de flee.
export class KinematicFlee {
  constructor(character, target, maxSpeed) {
    this.character = character; // El personaje que se moverá
    this.target = target; // El objetivo del que huir
    this.maxSpeed = maxSpeed; // Velocidad máxima de huida
  }

  getSteering() {
    let result = new SteeringOutput();

    // Obtiene la dirección opuesta al objetivo
    result.linear = this.character.position.clone().subtract(this.target.position);

    // Normaliza la dirección y escala a la velocidad máxima
    result.linear.normalize().scale(this.maxSpeed);

    // Ajustar la orientación hacia la dirección de huida
    this.character.orientation = this.newOrientation(
      this.character.orientation,
      result.linear
    );

    result.angular = 0; // Mantener la rotación en 0
    return result;
  }

  newOrientation(currentOrientation, linear) {
    if (linear.length() > 0) {
      return Math.atan2(linear.y, linear.x); // Cambia a la dirección del movimiento
    }
    return currentOrientation; // Mantiene la orientación actual si no hay movimiento
  }
}
