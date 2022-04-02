import {Vector2} from "./vector2";

export class Player {
    #player = $();
    #speed = 0;
    #currentYSpeed = 0;
    #currentXSpeed = 0;
    #position = new Vector2(0, 0);
    #movement = new Vector2(0, 0);
    #stopMoving = false;
    #gravity = 0;
    #jumps = 0;

    constructor(player, startX, startY, speed, gravity) {
        this.#player = $(player);
        this.#speed = speed;
        this.#gravity = gravity;

        this.#updatePos(startX, startY);
    }

    #clampCurrentYSpeed(speed) {
        this.#currentYSpeed = Math.min(Math.max(speed, -this.#speed), this.#speed);
    }

    #clampCurrentXSpeed(speed) {
        this.#currentXSpeed = Math.min(Math.max(speed, 0), this.#speed);
    }

    #updatePos(x, y) {
        this.#position.set(x, y);
        this.#player.css({
            bottom: y,
            left: x
        });
    }

    update(delaySeconds) {
        let moveVecNorm = Vector2.normalize(this.#movement);
        let deltaVec = new Vector2(moveVecNorm.X * delaySeconds * this.#currentXSpeed, moveVecNorm.Y * delaySeconds * this.#currentYSpeed);
        let newPos = Vector2.add(this.#position, deltaVec);

        newPos.Y = Math.max(newPos.Y, 0);
        if (newPos.Y === this.#position.Y) {
            // Stopped moving on Y axis
            // Reset Y
            this.#jumps = 0;
            this.#clampCurrentYSpeed(0);
            this.#movement.Y = 0;
        }

        this.#updatePos(newPos.X, newPos.Y);

        // Apply gravity
        this.#clampCurrentYSpeed(this.#currentYSpeed - (this.#gravity * delaySeconds));

        // Apply momentum
        if (this.#stopMoving === true) {
            this.#clampCurrentXSpeed(this.#currentXSpeed - (this.#gravity * delaySeconds));
        }
    }

    jump() {
        if (this.#jumps < 2) {
            this.#clampCurrentYSpeed(this.#currentYSpeed += this.#speed);
            this.#movement.Y = 1;
            this.#jumps++;
        }
    }

    stopMoving () {
        this.#stopMoving = true;
    }

    moveLeft () {
        this.#stopMoving = false;
        this.#clampCurrentXSpeed(this.#currentXSpeed += this.#speed);
        this.#movement.X = -1;
    }

    moveRight () {
        this.#stopMoving = false;
        this.#clampCurrentXSpeed(this.#currentXSpeed += this.#speed);
        this.#movement.X = 1;
    }
}
