import { SteeringOutput } from './SteeringOutput.js';

export class KinematicArrive {
  constructor(character, target, maxSpeed, targetRadius, slowRadius) {
    this.character = character; // Personaje que se moverá
    this.target = target; // El objetivo
    this.maxSpeed = maxSpeed; // Velocidad máxima
    this.targetRadius = targetRadius; // Radio objetivo
    this.slowRadius = slowRadius; // Radio de desaceleración
    this.timeToTarget = 0.25; // Tiempo para llegar al objetivo
  }

  getSteering() {
    let result = new SteeringOutput();

    // Obtiene la dirección hacia el objetivo
    result.linear = this.target.position.clone().subtract(this.character.position);
    const distance = result.linear.length();

    // Si estamos dentro del radio objetivo, no se necesita movimiento
    if (distance < this.targetRadius) {
      return null; // No moverse si está dentro del radio
    }

    // Calcular la velocidad objetivo
    let targetSpeed =
      distance > this.slowRadius
        ? this.maxSpeed
        : this.maxSpeed * (distance / this.slowRadius);
    
    result.linear.normalize().scale(targetSpeed);

    // Calcular la diferencia entre la velocidad objetivo y la actual
    result.linear = result.linear.subtract(this.character.velocity).scale(1 / this.timeToTarget);

    // Limitar la aceleración si excede el máximo
    if (result.linear.length() > this.character.maxAcceleration) {
      result.linear.normalize().scale(this.character.maxAcceleration);
    }

    // Ajustar la orientación hacia la dirección deseada
    this.character.orientation = this.newOrientation(
      this.character.orientation,
      result.linear
    );

    result.angular = 0; // Mantener la rotación en 0 si no es necesario
    return result;
  }

  newOrientation(currentOrientation, linear) {
    if (linear.length() > 0) {
      return Math.atan2(linear.y, linear.x); // Cambia a la dirección del movimiento
    }
    return currentOrientation; // Mantiene la orientación actual si no hay movimiento
  }
}
