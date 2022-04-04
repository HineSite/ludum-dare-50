import { Vector2 } from "./vector2.js";

export class Player {
    #player = $();
    #speed = 0; // The speed moved on the x-axis
    #decelSpeed = 0; // Deceleration speed on ground (think friction)
    #currentYSpeed = 0;
    #currentXSpeed = 0;
    #position = new Vector2(0, 0);
    #movement = new Vector2(0, 1);
    #stopMoving = false;
    #gravity = 0; // Speed of gravity
    #jumps = 0;
    #playerWidth = 0;
    #audio = null;
    #health = 100;

    constructor(player, startX, startY, speed, decelSpeed, gravity, audio) {
        this.#player = $(player);
        this.#speed = speed;
        this.#decelSpeed = decelSpeed;
        this.#gravity = gravity;
        this.#audio = audio;
        this.#playerWidth = this.#player.width();

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

    #takeDamage(damage) {
        this.#health -= damage;
    }

    update(delaySeconds, platforms) {
        let moveVecNorm = Vector2.normalize(this.#movement);
        let deltaVec = new Vector2(moveVecNorm.X * delaySeconds * this.#currentXSpeed, moveVecNorm.Y * delaySeconds * this.#currentYSpeed);
        let newPos = Vector2.add(this.#position, deltaVec);
        //console.log(this.#position.Y + ' - ' + newPos.Y);

        let movingOnY = (Math.abs(newPos.Y - this.#position.Y) > 3);
        //let movingDownOnY = (movingOnY && ((newPos.Y +3) - this.#position.Y) > 0);
        //console.log(movingDownOnY);

        newPos.Y = Math.max(newPos.Y, 0);
        if (newPos.Y === this.#position.Y) {
            this.#stopMovingY();
        }
        else if (newPos.Y < this.#position.Y) {
            // If moving down on Y, check every platform to see if we are standing on it.
            // ToDo: Optimise.

            let footX = newPos.X + (this.#playerWidth * .5);
            let footY = newPos.Y;
            for (let i = 0; i < platforms.length; i++) {
                if (platforms[i].restingOnPlatform(footX, footY)) {
                    //console.log('on platform: ' + i + ' with damage of: ' + platforms[i].getDamage());
                    newPos.Y = platforms[i].getTop(); // Pixel perfect!
                    this.#takeDamage(platforms[i].getDamage());
                    this.#stopMovingY();

                    break;
                }
                else {
                    //console.log('not on platform: ' + i);
                }
            }
        }

        if (newPos.X < this.#position.X) { // If moving left
            newPos.X = Math.max(newPos.X, 0); // Must not leave board.
        }
        else if (newPos.X > this.#position.X) {
            newPos.X = Math.min(newPos.X, 1200 - this.#playerWidth); // It's a magic number, just roll with it.
        }

        // Apply gravity
        this.#clampCurrentYSpeed(this.#currentYSpeed - (this.#gravity * delaySeconds));

        // Apply momentum
        // SopMoving is true if the user is no longer holding an x-axis movement button
        if (this.#stopMoving === true) {
            this.#clampCurrentXSpeed(this.#currentXSpeed - (this.#decelSpeed * delaySeconds));
        }

        this.#updatePos(newPos.X, newPos.Y);
    }

    jump() {
        if (this.#jumps < 2) {
            this.#audio['jumpFx'].play();

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

    get position () {
        return this.#position;
    }

    get health () {
        return this.#health
    }

    set speed (speed) {
        this.#speed = speed;
    }

    set decelSpeed (decelSpeed) {
        this.#decelSpeed = decelSpeed;
    }
}
