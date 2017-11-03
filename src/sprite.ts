export class Sprite {
    image: HTMLCanvasElement;
    size: number;

    constructor (image: HTMLCanvasElement) {
        this.image = image;
        this.size = image.width
    }
}