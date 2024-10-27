

export function createAtlas(frameHeight: number,
    frameWidth: number,
    imageWidth: number,
    imageHeight: number,
    filename: string
) {

    let frames: Map<String, any> = new Map<string, any>();

    let y = 0;

    let frameIndex = 0;
    while (y < imageHeight) {

        let x = 0;
        while (x < imageWidth) {

            let frameName = `{frameIndex}`;

            frames.set(frameName, generateFrame(x, y, frameWidth, frameHeight));

            x += frameWidth;
            frameIndex++;
        }
        y += frameHeight;
        frameIndex++;
    }
    // genreate the rframes
    let ret =
    {
        'frames': frames,
        "meta": {
            "image": filename,
            "format": "RGBA8888",
            "size": {
                "w": imageWidth,
                "h": imageHeight
            },
            "scale": 1
        }
    }

    return ret;
}

function generateFrame(x: number, y: number, w: number, h: number) {

    const ret = {
        "frame": {
            "x": x,
            "y": y,
            "w": w,
            "h": h
        },
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {
            "x": x,
            "y": y,
            "w": w,
            "h": y
        },
        "sourceSize": {
            "w": w,
            "h": h
        },
        "pivot": {
            "x": 0.5,
            "y": 0.5
        }
    }

    return ret;
}