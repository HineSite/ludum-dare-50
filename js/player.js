import {Vector2} from "./vector2";
import {Platform} from "./platform";

export class Player {
    #player = $();
    #speed = 0;
    #currentYSpeed = 0;
    #currentXSpeed = 0;
    #position = new Vector2(0, 0);
    #movement = new Vector2(0, 1);
    #stopMoving = false;
    #gravity = 0;
    #jumps = 0;
    #playWidth = 0;

    constructor(player, startX, startY, speed, gravity) {
        this.#player = $(player);
        this.#speed = speed;
        this.#gravity = gravity;
        this.#playWidth = this.#player.width();

        this.#updatePos(startX, startY);
    }

    #clampCurrentYSpeed(speed) {
        this.#currentYSpeed = Math.min(Math.max(speed, -this.#gravity), this.#gravity);
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

    update(delaySeconds, platforms) {
        let moveVecNorm = Vector2.normalize(this.#movement);
        let deltaVec = new Vector2(moveVecNorm.X * delaySeconds * this.#currentXSpeed, moveVecNorm.Y * delaySeconds * this.#currentYSpeed);
        let newPos = Vector2.add(this.#position, deltaVec);

        newPos.Y = Math.max(newPos.Y, 0);
        if (newPos.Y === this.#position.Y) {
            this.#stopMovingY();
        }
        else if (newPos.Y < this.#position.Y) {
            // If moving down on Y, check every platform to see if we are standing on it.
            // ToDo: Optimise.

            let footX = newPos.X;
            let footY = newPos.Y;
            for (let i = 0; i < platforms.length; i++) {
                if (platforms[i].restingOnPlatform(footX, footY)) {
                    newPos.Y = platforms[i].getTop(); // Pixel perfect!
                    this.#stopMovingY();

                    break;
                }
            }
        }

        if (newPos.X < this.#position.X) { // If moving left
            newPos.X = Math.max(newPos.X, 0); // Must not leave board.
        }
        else if (newPos.X > this.#position.X) {
            newPos.X = Math.min(newPos.X, 1200 - this.#playWidth); // It's a magic number, just roll with it.
        }

        this.#updatePos(newPos.X, newPos.Y);

        // Apply gravity
        this.#clampCurrentYSpeed(this.#currentYSpeed - (this.#gravity * delaySeconds));

        // Apply momentum
        if (this.#stopMoving === true) {
            this.#clampCurrentXSpeed(this.#currentXSpeed - (this.#speed * delaySeconds));
        }
    }

    jump() {
        if (this.#jumps < 2) {
            this.#clampCurrentYSpeed(this.#currentYSpeed += this.#gravity);
            this.#movement.Y = 1;
            this.#jumps++;
        }
    }

    #stopMovingY () {
        // Stopped moving on Y axis
        // Reset Y
        this.#jumps = 0;
        this.#clampCurrentYSpeed(0);
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
