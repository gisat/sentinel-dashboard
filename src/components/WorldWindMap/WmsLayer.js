import WorldWind from 'webworldwind-esa';

const {
    WmsLayer,
} = WorldWind;

/**
 * Class extending WorldWind.RenderableLayer.
 * @param options {Object}
 * @augments WorldWind.RenderableLayer
 * @constructor
 */
class CustomWmsLayer extends WmsLayer {
	constructor(options = {}) {
        super(options);
        this.key = options.key;
    };
}

export default CustomWmsLayer;

