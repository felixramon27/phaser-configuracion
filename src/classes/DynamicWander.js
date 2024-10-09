export class DynamicWander {
  constructor(character, radius, maxAngle) {
    this.character = character;
    this.radius = radius;
    this.maxAngle = maxAngle;
    this.angle = 0; // Ángulo inicial
  }

  getSteering() {
    // Lógica para deambular
    this.angle += (Math.random() - 0.5) * this.maxAngle; // Cambia el ángulo de forma aleatoria
    const x = this.character.x + this.radius * Math.cos(this.angle);
    const y = this.character.y + this.radius * Math.sin(this.angle);
    
    // Mueve el personaje hacia la nueva posición
    this.character.x = x; // Usar propiedades x e y directamente
    this.character.y = y;

    // Agrega aquí más lógica de movimiento si es necesario
  }
}
