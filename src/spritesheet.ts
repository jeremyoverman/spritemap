import * as Sprite from './sprite';
import * as lib from './lib';

export interface IOpts {
    tile_size: number
}

export class SpriteSheet {
    opts: IOpts;
    src: string | HTMLImageElement | HTMLCanvasElement | Sprite.Sprite[][];
    image: HTMLImageElement;
    // canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    sprites: Sprite.Sprite[][];

    /**
     * A sliced sprite sheet
     * 
     * @param image The source of the sprite sheet image
     * @param opts The options for the spritesheet
     */
    constructor (src: string | HTMLImageElement | HTMLCanvasElement | Sprite.Sprite[][], opts: IOpts) {
        this.src = src;
        this.opts = opts;
    }

    /**
     * Cut canvas image into sprites based on the tile size
     * 
     * @param sheet The HTMLCanvasElement of the sprite sheet
     * @param tile_size The width and height of each slice
     */
    private cutSheet (sheet: HTMLCanvasElement, tile_size: number) {
        let width = sheet.width;
        let height = sheet.height;
        let sprites: Sprite.Sprite[][] = [];

        console.log(width, height);

        // For every row
        for (let x = 0; x < width; x += tile_size) {
            let row: Sprite.Sprite[] = [];

            // For every column
            for (let y = 0; y < height; y += tile_size) {
                let [canvas, context] = lib.createCanvas();
                canvas.width = canvas.height = tile_size;

                context.drawImage(
                    sheet, // The input image
                    x, y, tile_size, tile_size, // The source parameters
                    0, 0, tile_size, tile_size // The destination parameters
                );

                let sprite = new Sprite.Sprite(canvas);
                row.push(sprite);
            }

            sprites.push(row);
        }

        return sprites;
    }

    isSpriteGrid (sprites: any): sprites is Sprite.Sprite[][] {
        let valid = true;

        if (Array.isArray(sprites)) {
            for (let y = 0; y += 1; y < sprites.length) {
                let row = sprites[y];

                if (!Array.isArray(row)) {
                    valid = false;
                    break;
                }

                for (let x = 0; x += 1; x < row.length) {
                    let sprite = row[x];

                    if (!(sprite instanceof Sprite.Sprite)) {
                        valid = false;
                        break;
                    }
                }
            }
        }

        return valid;
    }

    /**
     * Get a tile at (x, y)
     * 
     * @param x The col of the tile
     * @param y The row of the tile
     */
    getSprite (x: number, y: number) {
        return this.sprites[x][y];
    }

    /**
     * Load the spritesheet. Must be called after instantiating the class since
     * this has to be asynchronous.
     */
    load () {
        return new Promise((resolve, reject) => {
            if (this.isSpriteGrid(this.src)) {
                this.sprites = this.src;
                return resolve();
            }

            lib.getCanvasFromSource(this.src)
                .then((canvas: HTMLCanvasElement) => {
                    this.sprites = this.cutSheet(canvas, this.opts.tile_size);
                })
                .then(() => {
                    resolve();
                });
        });
    }
}
