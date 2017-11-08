import * as Palette from './palette';

export type TCoordinate = [number, number];

export class Sprite {
    pixels: number[][];
    palette: Palette.Palette;

    constructor (image?: HTMLCanvasElement, palette?: Palette.Palette) {
        this.pixels = [];
        this.palette = palette || new Palette.Palette();

        if (image) this.pixelsFromImage(image);

        this.fillEmptyPixels();
    }

    private pixelsFromImage (image: HTMLCanvasElement) {
        let ctx = <CanvasRenderingContext2D>image.getContext('2d');


        let img_data = ctx.getImageData(0, 0, image.width, image.height);
        let data = img_data.data;

            console.log(img_data.height);

        for (let i = 0; i < data.length; i += 4) {
            let group = i / 4;
            let color = Array.from(data.slice(i, i + 4));

            let x = group % img_data.width;
            let y = Math.floor(group / img_data.width);

            console.log(x, y, color);
        }
    }

    private fillEmptyPixels () {
        for (let x = 0; x < this.pixels.length; x++) {
            if (!this.pixels[x]) this.pixels[x] = [];

            for (let y = 0; y < this.pixels[x].length; y++) {
                if (!this.pixels[x][y]) {
                    this.pixels[x][y] = Palette.BLANK_IDX;
                }
            }
        }
    }

    getPixel(x: number, y: number) {
        if (!this.pixels[x]) return Palette.BLANK_IDX;

        return this.pixels[x][y] || Palette.BLANK_IDX;
    }

    getPixelColor(x: number, y: number) {
        let idx = this.getPixel(x, y);

        return this.palette.getColor(idx);
    }

    setPixel(x: number, y: number, idx: number) {
        if (!this.pixels[x]) this.pixels[x] = [];

        this.pixels[x][y] = idx;

        this.fillEmptyPixels();

        return idx;
    }
}