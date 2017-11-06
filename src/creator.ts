import * as Sprite from './sprite';

export interface IOptions {
    image?: HTMLCanvasElement;
    width: number;
    height: number;
    zoom: number;
}

export const DEFAULT_OPTIONS: IOptions = {
    width: 16,
    height: 16,
    zoom: 20
}

export class Creator {
    private sprite: Sprite.Sprite;
    private isGridActive: boolean = false;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    options: IOptions;

    constructor (sprite?: Sprite.Sprite, options?: IOptions) {
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
        this.sprite = sprite || new Sprite.Sprite();

        this.canvas = document.createElement('canvas');
        this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');

        this.setGrid(this.isGridActive);
        this.setWidth();
        this.refreshSprite();
    }

    private drawLine (sx: number, sy: number, ex: number, ey: number, scale?: number) {
        scale = scale || 1;

        let width = sx === ex ? 1 : ex * scale;
        let height = sy === ey ? 1 : ey * scale;
        this.ctx.fillRect(sx * scale, sy * scale, width, height);
    }

    private setWidth () {
        this.canvas.width = this.options.width * this.options.zoom;
        this.canvas.height = this.options.height * this.options.zoom;
    }

    private refreshSprite () {
        for (let x = 0; x < this.options.width; x++) {
            for (let y = 0; y < this.options.height; y++) {
                let pixel = this.sprite.getPixel(x, y);

                this.drawPixel(x, y, pixel);
            }
        }
    }

    drawPixel (x: number, y: number, pixel: Sprite.IPixel) {
        let zoom = this.options.zoom;

        this.ctx.fillStyle = `rgba(${pixel.red}, ${pixel.green}, ${pixel.blue}, ${pixel.alpha})`;
        this.ctx.fillRect(x * zoom, y * zoom, zoom, zoom);

        this.setGrid(this.isGridActive);
    }

    setGrid (active?: boolean) {
        active = active === false ? false : true;

        this.isGridActive = active;

        let width = this.options.width;
        let height = this.options.height;
        let zoom = this.options.zoom;

        this.ctx.fillStyle = 'rgb(0,0,0)';

        for (let x = 0; x <= width; x += 1) {
            this.drawLine(x, 0, x, height, zoom);

            for (let y = 0; y <= height; y += 1) {
                this.drawLine(0, y, width, y, zoom);
            }
        }
    }
}