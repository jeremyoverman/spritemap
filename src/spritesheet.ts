import * as Sprite from './sprite';

export interface IOpts {
    tile_size: number
}

export class SpriteSheet {
    opts: IOpts;
    src: string | HTMLImageElement | HTMLCanvasElement;
    image: HTMLImageElement;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    sprites: Sprite.Sprite[][];

    /**
     * A sliced sprite sheet
     * 
     * @param image The source of the sprite sheet image
     * @param opts The options for the spritesheet
     */
    constructor (src: string | HTMLImageElement | HTMLCanvasElement, opts: IOpts) {
        this.src = src;
        this.opts = opts;
    }

    private imageToCanvas (img: HTMLImageElement) {
        let [canvas, context] = this.createCanvas();

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        context.drawImage(img, 0, 0);

        return canvas;
    }

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
     * @param sheet The HTML Image Element to be cut
     * @param tile_size The width and height of each slice
     */
    cutSheet (sheet: HTMLCanvasElement, tile_size: number) {
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
            this.getCanvasFromSource(this.src)
                .then(canvas => {
                    this.sprites = this.cutSheet(canvas, this.opts.tile_size);
                    this.canvas = canvas;
                })
                .then(() => {
                    resolve(this.canvas);
                });
        });
    }
}
