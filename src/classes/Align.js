import { SteeringOutput } from "./SteeringOutput.js";

export class Align {
  constructor(
    character, // El que rota (Green, en tu caso)
    target, // El objetivo de la rotación (Red)
    maxAngularAcceleration, // Máxima aceleración angular
    maxRotation, // Máxima velocidad de rotación
    targetRadius, // Radio en el que consideramos que está alineado
    slowRadius, // Radio en el que empezamos a reducir la velocidad
    timeToTarget // Tiempo en el que queremos alcanzar el objetivo
  ) {
    this.character = character;
    this.target = target;
    this.maxAngularAcceleration = maxAngularAcceleration;
    this.maxRotation = maxRotation;
    this.targetRadius = targetRadius;
    this.slowRadius = slowRadius;
    this.timeToTarget = timeToTarget || 0.1; // Tiempo de suavizado
  }

  getSteering() {
    let result = new SteeringOutput();

    // Calcular el ángulo entre la orientación del character (Green) y el target (Red)
    let rotation = this.target.orientation - this.character.orientation;

    // Normalizar el ángulo en el rango [-π, π]
    rotation = Phaser.Math.Angle.Wrap(rotation); // Utiliza la función de Phaser para normalizar

    // Verificar si estamos dentro del radio de "target"
    let rotationSize = Math.abs(rotation);
    if (rotationSize < this.targetRadius) {
      return null; // Ya estamos alineados, no necesitamos rotar más
    }

    // Si estamos fuera del slowRadius, debemos reducir la velocidad
    let targetRotation;
    if (rotationSize > this.slowRadius) {
      targetRotation = this.maxRotation;
    } else {
      targetRotation = (this.maxRotation * rotationSize) / this.slowRadius;
    }

    // La dirección debe ser la misma que el ángulo
    targetRotation *= rotation / rotationSize;

    // Aceleración angular para rotar hacia el objetivo
    result.angular = targetRotation - (this.character.body ? this.character.body.angularVelocity : 0);
    result.angular /= this.timeToTarget;

    // Asegurarse de que no exceda la aceleración angular máxima
    let angularAcceleration = Math.abs(result.angular);
    if (angularAcceleration > this.maxAngularAcceleration) {
      result.angular /= angularAcceleration;
      result.angular *= this.maxAngularAcceleration;
    }

    // Detener cualquier movimiento lineal (esto depende si usas movimiento lineal o no)
    result.linear.set(0, 0); // Asignar Vector2(0, 0) directamente

    return result;
  }
}
