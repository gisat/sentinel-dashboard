import WorldWind from 'webworldwind-esa';

const {
	RenderableLayer,
} = WorldWind;

/**
 * Class extending WorldWind.RenderableLayer. Layer can render specific layer for defined view range.
 * @param displayName {String}
 * @param options {Object}
 * @param options.key {String}
 * @param options.layers {Array}
 * @augments WorldWind.RenderableLayer
 * @constructor
 */
class MultiRangeLayer extends RenderableLayer {
	constructor(displayName, options) {
        super(displayName);
        this._rerenderMap = null;
		this.key = options.key;
		this.range = 0;


		this.intervals = [];
		this.layers = [];

		if(options.layers && options.layers.length > 0) {
			for (const layerOption of options.layers) {
				const rangeInterval = layerOption.rangeInterval;
				const layer = layerOption.layer;

				this.intervals = [...new Set([...this.intervals, ...rangeInterval])];
				this.layers = [...this.layers, layer];
			}
		}
	};
	
	getLayerByRange() {
		let i = 0
		while ((this.range > this.intervals[i] && this.range > this.intervals[i + 1]) || (this.range < this.intervals[i] && this.range < this.intervals[i + 1])) {
			if(i>100) {
				return null
			}
			i++
		}
		return this.layers[i]
	}

    onUpdateNavigator(view) {
		this.range = view.boxRange;
    }

	doRender(dc) {
		const layer = this.getLayerByRange();
		if(layer) {
			layer.doRender(dc);
		}
	}
}

export default MultiRangeLayer;

