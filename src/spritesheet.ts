import * as Sprite from './sprite';

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
     * Convert an HTMLImageElement to an HTMLCanvasElement
     * 
     * @param img The source image
     */
    private imageToCanvas (img: HTMLImageElement) {
        let [canvas, context] = this.createCanvas();

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        context.drawImage(img, 0, 0);

        return canvas;
    }

    /**
     * Given a file path, HTMLImageElement, or HTMLCanvasElement, return a promise
     * of an HTMLCanvasElement
     * 
     * @param source The source to create a canvas from
     */
    private getCanvasFromSource (source: string | HTMLImageElement | HTMLCanvasElement): Promise<HTMLCanvasElement> {
        return new Promise((resolve, reject) => {
            if (source instanceof HTMLCanvasElement) {
                resolve(source);
            } else if (source instanceof HTMLImageElement) {
                let canvas = this.imageToCanvas(source);

                resolve(canvas);
            } else if (typeof source === 'string') {
                this.createImage(source).then((img) => {
                    let canvas = this.imageToCanvas(img);

                    resolve(canvas);
                });
            } else {
                reject(new Error('Unable to convert source to canvas'));
            }
        });
    }

    /**
     * Create a new canvas
     * 
     * @returns [canvas, context]
     */
    private createCanvas (): [HTMLCanvasElement, CanvasRenderingContext2D] {
        let canvas = document.createElement('canvas');
        let context = <CanvasRenderingContext2D>canvas.getContext('2d');

        return [canvas, context];
    }

    /**
     * Create a new image
     * 
     * @param source The source of the image
     */
    private createImage (source: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            let image = new Image();

            image.src = source;
            image.onload = () => {
                resolve(image);
            }
        });
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
                let [canvas, context] = this.createCanvas();
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

            this.getCanvasFromSource(this.src)
                .then((canvas: HTMLCanvasElement) => {
                    this.sprites = this.cutSheet(canvas, this.opts.tile_size);
                })
                .then(() => {
                    resolve();
                });
        });
    }
}
