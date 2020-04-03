import WorldWind from 'webworldwind-esa';
import chroma from 'chroma-js';
const {
    Color
} = WorldWind;

/**
 * It represents the distribution for one creation of Choropleth.
 * @param options {Object}
 * @param options.opacity {Number} Number between 0 and 100
 * @param options.max {Number} Maximum amount represented in the Choropleth.
 * @param options.palettes {ColorPalette}
 * @constructor
 */
class Distribution {
    constructor(options) {
        this._hexs = this.prepareClasses(options.palettes, options.max, options.opacity, true);
    }

    /**
     * It should prepare available color classes based on the currently selected color palette, maximum amount which
     * might scale down the number of classes and alpha representing the opacity of the color.
     * @param palette {Object}
     * @param max {Number} Represents maximum in current choropleth. Mainly to allow scaling down if it too low.
     * @param alpha {Number} 0 - 100 represents opacity in percents
     * @param isHex
     */
    prepareClasses(palette, max, alpha, isHex) {
        let amountOfClasses = max < 17 ? max : 17;
        this.oneLevel = max / amountOfClasses;

        let colors = chroma.scale(palette.colors).colors(amountOfClasses);
        return colors.map(function (color) {
            if (!isHex) {
                let rgb = chroma(color).rgb();
                return new Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, alpha);
            } else {
                return chroma(color).hex();
            }
        });
    }
}

export default Distribution;