import { SteeringOutput } from './SteeringOutput.js';

export class Wander {
  constructor(character, maxSpeed, maxRotation) {
    this.character = character;
    this.maxSpeed = maxSpeed;
    this.maxRotation = maxRotation;
  }

  getSteering() {
    let result = new SteeringOutput();

    // Generar una rotación aleatoria
    let randomRotation = (Math.random() - 0.5) * 2 * this.maxRotation;

    // Actualizar la rotación del personaje
    this.character.orientation += randomRotation;

    // Calcular la velocidad en función de la orientación
    let velocityX = Math.cos(this.character.orientation) * this.maxSpeed;
    let velocityY = Math.sin(this.character.orientation) * this.maxSpeed;

    // Establecer la nueva velocidad
    result.linear.set(velocityX, velocityY);
    result.angular = randomRotation;

    // Calcular la nueva orientación del personaje según la dirección en la que se mueve
    this.character.orientation = Math.atan2(result.linear.y, result.linear.x);

    return result;
  }
}
