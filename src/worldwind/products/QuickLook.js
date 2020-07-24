export default class QuickLook {
    constructor(iconUrl, fetch) {
        this._icon = iconUrl;
        this._fetch = fetch;

        this._image = null;
    }

    /**
     * Loads icon for the specific QuickLook in the form of image. Once the image was loaded, it is cached.
     * @returns {Promise<Image>}
     */
    async icon() {
        if(this._image) {
            return this._image;
        }
        try {
            // The request needs to be authorized
            const response = await this._fetch(this._icon, {
                headers: {
                    "Accept": "blob",
                }
            });
            if(!response.ok) {
                throw new Error('ERROR QuickLook#icon Status: ' + response.status);
            }
            const blobData = await response.blob();
            const url = window.URL.createObjectURL(blobData);
            const image = await this.createImage(url);
            window.URL.revokeObjectURL(url);
    
            this._image = image;
            return image;    
        } catch (err) {
            throw new Error('ERROR QuickLook#icon Status: ' + err.message);
        }
    }

    async createImage(url) {
        return new Promise((resolve, reject) => {
            flipImage(url, (base64src) => {
                const imageOfQuickLook = new Image();
                imageOfQuickLook.addEventListener('load', () => {
                    resolve(imageOfQuickLook);
                }, false);
                imageOfQuickLook.src = base64src;
            });
        });
    }
}

function flipImage (srcBase64, callback) {
    const img = new Image();

    // https://stackoverflow.com/questions/20600800/js-client-side-exif-orientation-rotate-and-mirror-jpeg-images
    // https://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side/32490603#32490603
    const srcOrientation = 4;

    img.onload = function() {
        var width = img.width,
            height = img.height,
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext("2d");
    
        // set proper canvas dimensions before transform & export
        if (4 < srcOrientation && srcOrientation < 9) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }
    
        // transform context before drawing image
        switch (srcOrientation) {
          case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
          case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
          case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
          case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
          case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
          case 7: ctx.transform(0, -1, -1, 0, height, width); break;
          case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
          default: break;
        }
    
        // draw image
        ctx.drawImage(img, 0, 0);
    
        // export base64
        callback(canvas.toDataURL());
      };

      img.src = srcBase64;
}