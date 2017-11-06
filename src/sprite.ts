export interface IPixel {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

export const EMPTY_PIXEL: IPixel = { red: 0, blue: 0, green: 0, alpha: 0 }

export class Sprite {
    pixels: IPixel[][];

    constructor (image?: HTMLCanvasElement | IPixel[][]) {
        this.pixels = [];
        this.fillEmptyPixels();
    }

    private fillEmptyPixels () {
        for (let x = 0; x < this.pixels.length; x++) {
            console.log(x);
            if (!this.pixels[x]) this.pixels[x] = [];

            for (let y = 0; y < this.pixels[x].length; y++) {
                console.log(y);
                if (!this.pixels[x][y]) {
                    this.pixels[x][y] = EMPTY_PIXEL;
                }
            }
        }
    }

    getPixel(x: number, y: number) {
        if (!this.pixels[x]) return EMPTY_PIXEL;

        return this.pixels[x][y] || EMPTY_PIXEL;
    }

    setPixel(x: number, y: number, color: number[]) {
        if (!this.pixels[x]) this.pixels[x] = [];

        this.pixels[x][y] = {
            red: color[0],
            green: color[1],
            blue: color[2],
            alpha: color[3] === undefined ? 1 : color[3],
        }

        this.fillEmptyPixels();
    }
}