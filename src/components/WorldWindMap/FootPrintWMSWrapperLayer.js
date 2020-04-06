import WorldWind from 'webworldwind-esa';
import WorldWindX from 'webworldwind-x';
import SciHubServices from './utils/SciHubServices';
import MultiRangeLayer from './MultiRangeLayer';
import { getSatelitesSelectOptions } from '../../context/selectors/components/satellitesSelect';

const {
	ArgumentError,
    RenderableLayer,
    WmsLayer,
	Logger,
} = WorldWind;

/**
 * Class extending WorldWind.RenderableLayer. Layer create for each added renderable coresponding WMS layer.
 * @param displayName {String}
 * @augments WorldWind.RenderableLayer
 * @constructor
 */
class FootPrintWMSWrapperLayer extends RenderableLayer {
	constructor(displayName) {
		super(displayName);

		/**
		 * The array of renderables;
		 * @type {Array}
		 * @readonly
		 */
		this.renderables = [];

		/**
		 * An array with two elements:
		 * start time and end time of the visible range.
		 * @type {Date[]}
		 */
		this.timeRange = [];

		/**
		 * An array of WMS layers for each renderable:
		 * @type {Array}
		 */
		this.layers = [];
	};

	/**
	 * Adds a renderable to this layer.
	 * @param {Renderable} renderable The renderable to add.
	 * @throws {ArgumentError} If the specified renderable is null or undefined.
	 */
	addRenderable(renderable) {
		if (!renderable) {
			throw new ArgumentError(Logger.logMessage(Logger.LEVEL_SEVERE, "RenderableLayer", "addRenderable",
				"missingRenderable"));
		}

		this.renderables.push(renderable);

		this.update();
	};

	/**
	 * Adds an array of renderables to this layer.
	 * @param {Renderable[]} renderables The renderables to add.
	 * @throws {ArgumentError} If the specified renderables array is null or undefined.
	 */
	addRenderables(renderables) {
		if (!renderables) {
			throw new ArgumentError(Logger.logMessage(Logger.LEVEL_SEVERE, "RenderableLayer", "addRenderables",
				"The renderables array is null or undefined."));
		}

		for (var i = 0, len = renderables.length; i < len; i++) {
			this.addRenderable(renderables[i]);
		}
	};

	/**
	 * Removes a renderable from this layer.
	 * @param {Renderable} renderable The renderable to remove.
	 */
	removeRenderable(renderable) {
		var index = this.renderables.indexOf(renderable);
		if (index >= 0) {
			this.renderables.splice(index, 1);
		}
		this.update();
	};

	/**
	 * Removes all renderables from this layer. Does not call dispose on those renderables.
	 */
	removeAllRenderables() {
		this.renderables = [];
		this.update();
	};

	getLayerFromRenderable(renderable) {
		const serviceAddress = `https://eoapps.solenix.ch/dias/onda?service=wms`;
		const config = SciHubServices.getWmsProductFromONDA(renderable, renderable.userProperties.key, serviceAddress);
		const wmsLayer = new WmsLayer(config);
		return wmsLayer;
	}

	update() {
		//vzit renderables a vyrobit z nich wms vrstvy
		//uložit do layers
		this.layers = [];
		for (const renderable of this.renderables) {
			const layer = this.getLayerFromRenderable(renderable);
			this.layers.push(layer)
		}
	}

	// Documented in superclass.
	doRender(dc) {
		for(const layer of this.layers) {
			layer.doRender(dc);
		}
	};

	/**
	 * Internal function for solving the visibility based on time.
	 * The element is visible when its whole range is inside the selected time range.
	 */
	solveTimeVisibility(dc, renderable) {
		var selectedTimeRange = dc.currentLayer.timeRange;

		if (renderable.timeRange.length >= 2 && selectedTimeRange.length >= 2) {
			var minTime = renderable.timeRange[0];
			var maxTime = renderable.timeRange[1];
			var minSelectedTime = selectedTimeRange[0];
			var maxSelectedTime = selectedTimeRange[1];

			if (minTime < minSelectedTime  ||
				maxTime > maxSelectedTime) {
				return false;
			}
		}

		return renderable.enabled;
	};	
}

export default FootPrintWMSWrapperLayer;

