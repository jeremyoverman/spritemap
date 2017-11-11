import * as Palette from './palette';

export type TCoordinate = [number, number];
export type IPixels = number[][];

export class Sprite {
    pixels: IPixels;
    palette: Palette.Palette;

    constructor (image?: HTMLCanvasElement, palette?: Palette.Palette) {
        this.palette = palette || new Palette.Palette();

        if (image) this.pixels = this.pixelsFromImage(image);
        else this.pixels = [];

        this.fillEmptyPixels();
    }

    private pixelsFromImage (image: HTMLCanvasElement) {
        let ctx = <CanvasRenderingContext2D>image.getContext('2d');

        let img_data = ctx.getImageData(0, 0, image.width, image.height);
        let data = img_data.data;

        let pixels: IPixels = [];

        for (let i = 0; i < data.length; i += 4) {
            let group = i / 4;
            let color = <Palette.TColor>Array.from(data.slice(i, i + 4));

            let color_idx = this.palette.getOrSetColor(color);

            let x = group % img_data.width;
            let y = Math.floor(group / img_data.width);

            if (!pixels[y]) pixels[y] = [];

            pixels[y][x] = color_idx;
        }

        return pixels;
    }

    private fillEmptyPixels () {
        for (let y = 0; y < this.pixels.length; y++) {
            if (!this.pixels[y]) this.pixels[y] = [];

            for (let x = 0; x < this.pixels[y].length; x++) {
                if (!this.pixels[y][x]) {
                    this.pixels[y][x] = Palette.BLANK_IDX;
                }
            }
        }
    }

    getDimensions (): [number, number] {
        return [this.pixels[0].length, this.pixels[1].length];
    }

    getPixel(x: number, y: number) {
        if (!this.pixels[y]) return Palette.BLANK_IDX;

        return this.pixels[y][x] || Palette.BLANK_IDX;
    }

    getPixelColor(x: number, y: number) {
        let idx = this.getPixel(x, y);

        return this.palette.getColor(idx);
    }

    setPixel(x: number, y: number, idx: number) {
        if (!this.pixels[y]) this.pixels[y] = [];

        this.pixels[y][x] = idx;

        this.fillEmptyPixels();

        return idx;
    }
}