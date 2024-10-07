import { SteeringOutput } from './SteeringOutput.js';

export class Arrive {
  constructor(
    character,
    target,
    maxAcceleration,
    maxSpeed,
    targetRadius,
    slowRadius
  ) {
    this.character = character;
    this.target = target;
    this.maxAcceleration = maxAcceleration;
    this.maxSpeed = maxSpeed;
    this.targetRadius = targetRadius;
    this.slowRadius = slowRadius;
    this.timeToTarget = 0.1;
  }

  getSteering() {
    let result = new SteeringOutput();

    let direction = this.target.position
      .clone()
      .subtract(this.character.position);
    let distance = direction.length();

    if (distance < this.targetRadius) {
      return null; // No hace falta movimiento
    }

    let targetSpeed =
      distance > this.slowRadius
        ? this.maxSpeed
        : this.maxSpeed * (distance / this.slowRadius);
    let targetVelocity = direction.normalize().scale(targetSpeed);

    result.linear = targetVelocity
      .subtract(this.character.velocity)
      .scale(1 / this.timeToTarget);

    if (result.linear.length() > this.maxAcceleration) {
      result.linear = result.linear.normalize().scale(this.maxAcceleration);
    }

    result.angular = 0;
    return result;
  }
}
