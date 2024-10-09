import { Align } from './Align.js'; // Asegúrate de importar la clase Align
import { SteeringOutput } from './SteeringOutput.js';

export class Face extends Align {
  constructor(character, target) {
    super(character); // Llamada al constructor de Align
    this.target = target; // El personaje que queremos que los otros miren (red)
  }

  getSteering() {
    let result = new SteeringOutput();

    // 1. Calcular la dirección hacia el objetivo (red)
    let direction = this.target.position.clone().subtract(this.character.position);

    // Comprobar si la dirección es cero (no hay movimiento)
    if (direction.length() === 0) {
      return result; // No hay cambio de orientación
    }

    // 2. Calcular la nueva orientación
    let desiredOrientation = Math.atan2(-direction.x, direction.z);

    // Establecer la orientación deseada en el personaje
    this.character.orientation = desiredOrientation;

    // Delegar a Align para obtener la salida de dirección
    return super.getSteering(); // Llama al método getSteering de Align
  }
}
