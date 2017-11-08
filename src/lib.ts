/**
 * Given a file path, HTMLImageElement, or HTMLCanvasElement, return a promise
 * of an HTMLCanvasElement
 * 
 * @param source The source to create a canvas from
 */
export function getCanvasFromSource (source: string | HTMLImageElement | HTMLCanvasElement): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        if (source instanceof HTMLCanvasElement) {
            resolve(source);
        } else if (source instanceof HTMLImageElement) {
            let canvas = imageToCanvas(source);

            resolve(canvas);
        } else if (typeof source === 'string') {
            createImage(source).then((img) => {
                let canvas = imageToCanvas(img);

                resolve(canvas);
            });
        } else {
            reject(new Error('Unable to convert source to canvas'));
        }
    });
}

/**
 * Convert an HTMLImageElement to an HTMLCanvasElement
 * 
 * @param img The source image
 */
export function imageToCanvas (img: HTMLImageElement) {
    let [canvas, context] = createCanvas();

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    context.drawImage(img, 0, 0);

    return canvas;
}

/**
 * Create a new canvas
 * 
 * @returns [canvas, context]
 */
export function createCanvas (): [HTMLCanvasElement, CanvasRenderingContext2D] {
    let canvas = document.createElement('canvas');
    let context = <CanvasRenderingContext2D>canvas.getContext('2d');

    return [canvas, context];
}

/**
 * Create a new image
 * 
 * @param source The source of the image
 */
export function createImage (source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        let image = new Image();

        image.src = source;
        image.onload = () => {
            resolve(image);
        }
    });
}
