export type TColor = [number, number, number, number];

export const DEFAULT_COLORS: TColor[] = [
    [0,   0,    0,  1], // Black
    [255, 255, 255, 1], // White
    [255, 0,   0,   1], // Red
    [0,   255, 0,   1], // Green
    [0,   0,   255, 1], // Blue
    [255, 255, 0,   1], // Yellow
    [0,   255, 255, 1], // Teal
    [255, 0,   255, 1]  // Pink
];

export class Palette {
    colors: TColor[];
    size: number
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor (colors?: TColor[], size?: number) {
        this.size = size || 8;
        this.canvas = document.createElement('canvas');
        this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');
        this.colors = colors || DEFAULT_COLORS;

        this.canvas.width = 120 + 1;
        this.canvas.height = 120 + 1;

        this.drawColors();
    }

    setColor (idx: number, color: TColor) {
        this.colors[idx] = color;
    }

    getColor (idx: number) {
        return this.colors[idx];
    }

    getRGBAFromColor (color: TColor) {
        let [r, g, b, a] = color;

        return `rgba(${r}, ${g}, ${b}, ${a}`;
    }

    drawColors () {
        let h = this.canvas.height - 1; // Height of the canvas
        let w = this.canvas.width - 1; // Width of the canvas
        let s = h / 3; // Size of block

        for (let i = 0, c = 0 ; i < 9; i++) {
            let x = (i * s) % h; // Wrap x on the square
            let y = Math.floor((i * s) / h) * s; // Wrap y on the square

            if (i === 4) {
                // Draw an "X"
                this.ctx.fillStyle = '#000000';
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + s, y + s);
                this.ctx.stroke();

                this.ctx.moveTo(x + s, y);
                this.ctx.lineTo(x, y + s);
                this.ctx.stroke();
                continue; // The middle block doesn't get a color
            }

            // Draw the color
            // The colors need to increment independent of the index since we
            // continue on the index earlier -- we'd skip a color if we use i.
            let color = this.colors[c++] || [0, 0, 0, 0];
            this.ctx.fillStyle = this.getRGBAFromColor(color);
            this.ctx.fillRect(x + 1, y, s, s);

            this.ctx.fillStyle = '#000000';
            this.ctx.strokeRect(x + .5, y + .5, s, s);
        }
    }
}