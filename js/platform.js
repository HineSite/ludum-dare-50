export class Platform {
    static Platforms = [];
    static BoardWidth = 1200; // You saw nothing!
    static PlatformTop = 0;

    #Classes = '';
    #Styles = '';
    #X = 0;
    #Y = 0;
    #W = 0;
    #H = 20;
    #FromLeft = true;
    #Damage = 0;
    #ActiveDamage = 0;
    #OnPlatform = false;

    constructor(classes, styles, x, y, w, h, fromLeft, damge) {
        this.#Classes = classes;
        this.#Styles = styles;
        this.#X = x;
        this.#Y = y;
        this.#W = w;
        this.#H = h;
        this.#FromLeft = fromLeft;
        this.#Damage = !damge ? 0 : damge;
    }

    restingOnPlatform(x, y) {
        let top = (this.#Y + this.#H) - Platform.PlatformTop;
        if (y >= (top - 5) && y <= (top +5)) {
            // If y is within 2 pixels of the top.

            let left = this.#FromLeft ? (this.#X) : (Platform.BoardWidth - this.#X - this.#W);
            let right = this.#FromLeft ? (this.#X + this.#W) : (Platform.BoardWidth - this.#X);
            //console.log('left: ' + left + ' | right: ' + right + ' | x: ' + x + ' | y: ' + y)
            if (x >= left && x <= right) {
                if (!this.#OnPlatform) {
                    // Only activate damage if they were not on the platform, but are now.
                    this.#ActiveDamage = this.#Damage;
                }

                this.#OnPlatform = true;
                return true;
            }
        }

        this.#OnPlatform = false;
        return false;
    }

    getDamage() {
        // This prevents continuous damage caused by standing on the platform for more than ~17ms...
        if (this.#ActiveDamage !== 0) {
            this.#ActiveDamage = 0;
            return this.#Damage;
        }

        return 0;
    }

    getTop() {
        return (this.#Y + this.#H) - Platform.PlatformTop;
    }

    getHtml() {
        let side = this.#FromLeft ? 'left' : 'right';
        let styles = 'width: ' + this.#W + 'px; height: ' + this.#H + 'px; ' + side + ': ' + this.#X + 'px; bottom: ' + this.#Y + 'px;';
        styles += ' ' + this.#Styles;

        return '<div class="platform ' +  this.#Classes + '" style="' + styles + '"></div>'
    }
}
