export type TColor = [number, number, number, number];

export const BLANK_IDX = -1;

export const BLANK_COLOR: TColor = [0, 0, 0, 0];

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
    private margin = 5;
    private height: number;
    private width: number;

    colors: TColor[];
    size: number
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    current: number = 0;

    constructor (colors?: TColor[]) {
        this.canvas = document.createElement('canvas');
        this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');
        this.colors = colors || [];

        this.setWidth();
        this.createEvents();
        this.drawColors();
    }

    private setWidth() {
        this.height = 120;
        this.width = 120 * (Math.floor(this.colors.length / 8) + 1);

        this.canvas.width = this.width + (this.margin * 2) + 1;
        this.canvas.height = this.height + (this.margin * 2) + 1;
    }

    private createEvents () {
        this.canvas.addEventListener('mousedown', (evt: MouseEvent) => {
            let x = evt.offsetX;
            let y = evt.offsetY;

            let col = Math.floor(x / (this.height / 3))
            let row = Math.floor(y / (this.height / 3));

            let group = Math.floor(col / 3);

            console.log(group);

            let idx = col + (row * 3) + (group * 9);

            if (idx >= this.colors.length ) return;

            this.current = idx;
            this.drawColors();
        });
    }

    private isIdxCenter(idx: number) {
        return idx - 9 * (Math.floor(idx / 9)) === 4;
    }

    private getCoordinatesFromIdx (idx: number, includeCenter?: boolean) {
        let h = this.height; // Height of the canvas
        let w = this.width; // Width of the canvas
        let s = h / 3; // Size of block

        if (this.isIdxCenter(idx) && !includeCenter) idx++;

        let group = Math.floor(idx / 9); 

        let x = ((idx * s) % h) + (group * h); // Wrap x on the square
        let y = (Math.floor((idx * s) / h) * s) % (s * 3); // Wrap y on the square

        return [x + this.margin, y + this.margin, s];
    }

    highlightColor (idx: number) {
        let [x, y, s] = this.getCoordinatesFromIdx(idx);
        let expand = this.margin;

        x -= expand;
        y -= expand;
        s += expand * 2;

        this.ctx.fillStyle = this.getRGBAFromColor(this.getColor(idx));
        this.ctx.fillRect(x, y, s, s);

        this.ctx.fillStyle = '#000000'
        this.ctx.strokeRect(x + .5, y + .5, s, s);
    }

    getOrSetColor (color: TColor) {
        let color_idx = 0;

        let filtered = this.colors.filter((c, idx) => {
            let is_match = color[0] === c[0] &&
                           color[1] === c[1] &&
                           color[2] === c[2] &&
                           color[3] === c[3];

            if (is_match) {
                color_idx = idx;
                return true;
            }
            
        });

        if (!filtered.length) color_idx = this.colors.push(color) - 1;

        this.drawColors();

        return color_idx;
    }

    setColor (idx: number, color: TColor) {
        this.colors[idx] = color;
        this.drawColors();
    }

    getColor (idx: number) {
        return this.colors[idx] || BLANK_COLOR;
    }

    getCurrentColor() {
        // console.log(this.current);
        console.log(this);
        return this.getColor(this.current);
    }

    getRGBAFromColor (color: TColor) {
        return `rgba(${color.join(',')})`;
    }

    drawColors () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.setWidth();

        for (let i = 0, c = 0 ; i < this.colors.length; i++) {
            let [x, y, s] = this.getCoordinatesFromIdx(i, true);

            if (this.isIdxCenter(i)) {
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

        this.highlightColor(this.current);
    }
}