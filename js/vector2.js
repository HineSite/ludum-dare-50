export class Vector2 {
    #X = 0;
    #Y = 0;

    constructor(x, y) {
        this.#X = x;
        this.#Y = y;
    }

    static normalize(vector2) {
        let mag = Math.sqrt((vector2.X * vector2.X) + (vector2.Y * vector2.Y));
        if (mag === 0) {
            return new Vector2(0, 0);
        }

        return new Vector2(vector2.X / mag, vector2.Y / mag);
    }

    // Subtracts the second vector from the first.
    static subtract(first, second) {
        return new Vector2(first.X - second.X, first.Y - second.Y);
    }

    // Adds to vectors
    static add(first, second) {
        return new Vector2(first.X + second.X, first.Y + second.Y);
    }

    static multiply(vector, scalar) {
        return new Vector2(vector.X * scalar, vector.Y + scalar);
    }

    set(x, y) {
        this.#X = x;
        this.#Y = y;
    }

    get X() {
        return this.#X;
    }

    get Y() {
        return this.#Y;
    }

    set X(x) {
        this.#X = x;
    }

    set Y(y) {
        this.#Y = y;
    }

    toString() {
        return '(' + this.#X + ', ' + this.#Y + ')';
    }
}
