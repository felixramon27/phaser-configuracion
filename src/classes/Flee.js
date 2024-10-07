import { SteeringOutput } from './SteeringOutput.js';

export class Flee {
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
