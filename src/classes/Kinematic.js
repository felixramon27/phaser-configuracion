export class Kinematic {
  constructor(position, velocity, orientation, rotation) {
    this.position = position; // Vector2
    this.velocity = velocity; // Vector2
    this.orientation = orientation; // Ángulo en radianes
    this.rotation = rotation; // Ángulo de rotación
  }

  update(steering, time) {
    try {

      if(steering.linear.length() > 0){
        this.position.x += this.velocity.x * time;
        this.position.y += this.velocity.y * time;
        this.orientation += this.rotation * time;

        // Actualiza la velocidad y rotación
        this.velocity.x += steering.linear.x * time;
        this.velocity.y += steering.linear.y * time;
        this.rotation += steering.angular * time;
      }

    } catch (error) {
      console.error("Error en Kinematic.update:", error);
    }
  }
}
