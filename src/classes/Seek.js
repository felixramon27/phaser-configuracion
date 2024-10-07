import { SteeringOutput } from "./SteeringOutput.js";

export class Seek {
  constructor(character, target, maxAcceleration) {
    this.character = character; // Personaje que se moverá
    this.target = target; // El objetivo
    this.maxAcceleration = maxAcceleration; // Máxima aceleración permitida
  }

  getSteering() {
    let result = new SteeringOutput();

    // Calcula la dirección hacia el objetivo
    result.linear = this.target.position.clone().subtract(this.character.position);
    
    // Normaliza la dirección
    if (result.linear.length() > 0) {
      result.linear.normalize(); // Normaliza para obtener la dirección
      result.linear.scale(this.maxAcceleration); // Aplica la aceleración máxima
    } else {
      // Si están en la misma posición, no se necesita movimiento
      result.linear.set(0, 0);
    }

    result.angular = 0; // No se necesita rotación
    return result;
  }
}
