export class Platform {
    static Platforms = [];
    static BoardWidth = 1200; // You saw nothing!

    #Classes = '';
    #Styles = '';
    #X = 0;
    #Y = 0;
    #W = 0;
    #H = 20;
    #FromLeft = true;

    constructor(classes, styles, x, y, w, h, fromLeft) {
        this.#Classes = classes;
        this.#Styles = styles;
        this.#X = x;
        this.#Y = y;
        this.#W = w;
        this.#H = h;
        this.#FromLeft = fromLeft;
    }

    restingOnPlatform(x, y) {
        let top = (this.#Y + this.#H);
        if (y >= (top - 5) && y <= (top +5)) {
            // If y is within 2 pixels of the top.

            let left = this.#FromLeft ? (this.#X) : (Platform.BoardWidth - this.#X - this.#W);
            let right = this.#FromLeft ? (this.#X + this.#W) : (Platform.BoardWidth - this.#X);
            if (x >= left && x <= right) {
                return true;
            }
        }

        return false;
    }

    getTop() {
        return (this.#Y + this.#H);
    }

    getHtml() {
        let side = this.#FromLeft ? 'left' : 'right';
        let styles = 'width: ' + this.#W + 'px; height: ' + this.#H + 'px; ' + side + ': ' + this.#X + 'px; bottom: ' + this.#Y + 'px;';
        styles += ' ' + this.#Styles;

        return '<div class="platform ' +  this.#Classes + '" style="' + styles + '"></div>'
    }
}
