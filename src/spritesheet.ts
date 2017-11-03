import * as Sprite from './sprite';

export interface IOpts {
    tile_size: number
}

export class SpriteSheet {
    opts: IOpts;
    src: string;
    image: HTMLImageElement;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    sprites: Sprite.Sprite[][];

    /**
     * A sliced sprite sheet
     * 
     * @param src The source of the sprite sheet image
     * @param opts The options for the spritesheet
     */
    constructor (src: string, opts: IOpts) {
        this.src = src;
        this.opts = opts;
    }

    /**
     * Create a new canvas
     * 
     * @returns [canvas, context]
     */
    createCanvas (): [HTMLCanvasElement, CanvasRenderingContext2D] {
        let canvas = document.createElement('canvas');
        let context = <CanvasRenderingContext2D>canvas.getContext('2d');

        return [canvas, context];
    }

    /**
     * Create a new image
     * 
     * @param source The source of the image
     */
    createImage (source: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            let image = new Image();

            image.src = source;
            image.onload = () => {
                resolve(image);
            }
        });
    }

    /**
     * Cut an image into sprites based on the tile size
     * 
     * @param image The HTML Image Element to be cut
     * @param tile_size The width and height of each slice
     */
    cutSheet (image: HTMLImageElement, tile_size: number) {
        let width = image.naturalWidth;
        let height = image.naturalWidth;
        let sprites: Sprite.Sprite[][] = [];

        // For every row
        for (let x = 0; x < width; x += tile_size) {
            let row: Sprite.Sprite[] = [];

            // For every column
            for (let y = 0; y < height; y += tile_size) {
                let [canvas, context] = this.createCanvas();
                canvas.width = canvas.height = tile_size;

                context.drawImage(
                    image, // The input image
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
            this.createImage(this.src)
                .then((img) => {
                    let [canvas, context] = this.createCanvas();

                    context.drawImage(img, 0, 0);

                    this.canvas = canvas;
                    this.context = context;

                    return img;
                })
                .then(img => {
                    this.sprites = this.cutSheet(img, this.opts.tile_size);
                })
                .then(() => {
                    resolve(this.canvas);
                });
        });
    }
}
