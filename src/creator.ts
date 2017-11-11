import * as Sprite from './sprite';
import * as Palette from './palette';

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
    private previousDrawCoordinate: [number, number];

    private isMouseDown: boolean = false;
    private isGridActive: boolean = false;
    private isDrawing: boolean = false;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    options: IOptions;

    constructor (sprite?: Sprite.Sprite, options?: IOptions) {
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
        if (sprite) {
            this.sprite = sprite;
            [this.options.width, this.options.height] = sprite.getDimensions();
        }
        this.sprite = sprite || new Sprite.Sprite();

        this.canvas = document.createElement('canvas');
        this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');

        this.setGrid(this.isGridActive);
        this.setWidth();
        this.createEvents();
        this.refreshSprite();
    }

    private drawLine (sx: number, sy: number, ex: number, ey: number, scale?: number) {
        scale = scale || 1;

        let width = sx === ex ? 1 : ex * scale;
        let height = sy === ey ? 1 : ey * scale;
        this.ctx.fillRect(sx * scale, sy * scale, width, height);
    }

    private setWidth () {
        this.canvas.width = this.options.width * this.options.zoom + 1;
        this.canvas.height = this.options.height * this.options.zoom + 1;
    }

    private refreshSprite () {
        this.isDrawing = true;

        for (let x = 0; x < this.options.width; x++) {
            for (let y = 0; y < this.options.height; y++) {
                let color = this.sprite.getPixelColor(x, y);

                this.drawPixel(x, y, color);
            }
        }

        this.isDrawing = false;
    }

    private drawPixel (x: number, y: number, color: Palette.TColor) {
        let zoom = this.options.zoom;

        this.ctx.fillStyle = `rgba(${color.join(',')})`;
        this.ctx.fillRect(x * zoom, y * zoom, zoom, zoom);

        this.setGrid(this.isGridActive);
    }

    private handleClick (evt: MouseEvent) {
        if (!this.isMouseDown) return;

        let zoom = this.options.zoom;
        let x = Math.floor(evt.offsetX / zoom);
        let y = Math.floor(evt.offsetY / zoom);
        let prev = this.previousDrawCoordinate;

        if (Array.isArray(prev) && prev[0] === x && prev[1] === y) return;

        this.addPixel(x, y);
    }

    private createEvents () {
        this.canvas.addEventListener('mousemove', evt => this.handleClick(evt));
        this.canvas.addEventListener('mouseup', evt => this.isMouseDown = false);
        this.canvas.addEventListener('mousedown', evt => {
            this.isMouseDown = true;
            this.handleClick(evt);
        });
    }

    addPixel (x: number, y: number) {
        let color = this.sprite.palette.getCurrentColor();

        this.drawPixel(x, y, color);
    }

    setGrid (active?: boolean) {
        active = active === false ? false : true;

        this.isGridActive = active;

        let width = this.options.width;
        let height = this.options.height;
        let zoom = this.options.zoom;

        if (zoom === 1) return;

        this.ctx.fillStyle = 'rgb(0,0,0)';

        if (active) {
            for (let x = 0; x <= width; x += 1) {
                this.drawLine(x, 0, x, height, zoom);

                for (let y = 0; y <= height; y += 1) {
                    this.drawLine(0, y, width, y, zoom);
                }
            }
        } else {
            if (!this.isDrawing) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.refreshSprite();
            }
        }
    }
}