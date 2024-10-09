import { SteeringOutput } from './SteeringOutput.js';

export class VelocityMatching {
  constructor(character, target, maxAcceleration, maxSpeed) {
    this.character = character;
    this.target = target;
    this.maxAcceleration = maxAcceleration;
    this.maxSpeed = maxSpeed;
    this.timeToTarget = 0.1; // Tiempo para lograr la velocidad objetivo
  }

  getSteering() {
    let result = new SteeringOutput();

    // Calcular la dirección hacia el objetivo
    let direction = this.target.position.clone().subtract(this.character.position);
    
    // Si la dirección es muy pequeña, no hay movimiento
    let distance = direction.length();
    if (distance < 0.01) {
      return null; // No hace falta movimiento
    }
    
    direction.normalize(); // Normalizar la dirección

    // Calcular la velocidad objetivo basada en maxSpeed
    let targetVelocity = direction.scale(this.maxSpeed);

    // Calcular la diferencia entre la velocidad objetivo y la velocidad actual del personaje
    result.linear = targetVelocity.subtract(this.character.velocity).scale(1 / this.timeToTarget);

    // Limitar la aceleración al máximo permitido
    if (result.linear.length() > this.maxAcceleration) {
      result.linear = result.linear.normalize().scale(this.maxAcceleration);
    }

    // No hay cambio angular en velocity matching, así que lo dejamos en 0
    result.angular = 0;

    return result;
  }
}
