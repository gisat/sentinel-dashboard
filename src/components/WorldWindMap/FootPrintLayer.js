import WorldWind from 'webworldwind-esa';
import WorldWindX from 'webworldwind-x';
import MultiRangeLayer from './MultiRangeLayer';
import FootPrintWMSWrapperLayer from './FootPrintWMSWrapperLayer';

const {
    RenderableLayer,
	ArgumentError,
	Logger,
} = WorldWind;

/**
 * Layer integrates two different types of layers. WMS layer for less range and Renderable layer for high range.
 * @param displayName {String}
 * @augments WorldWind.Layer
 * @constructor
 */
class FootPrint extends MultiRangeLayer {
	constructor(displayName) {
		const options = {
			key: displayName,
			layers:[
				{
					rangeInterval: [0,4000000],
					layer: new FootPrintWMSWrapperLayer(`FootPrintWMSWrapperLayer-${displayName}`)
				},
				{
					rangeInterval: [4000000,220000000],
					layer: new RenderableLayer(`renderableLayer-${displayName}`)
				}
			]
		};
		
		super(displayName, options);
        
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
		
		for(const layer of this.layers) {
			if(typeof layer.addRenderable === 'function') {
				layer.addRenderable(renderable);
			}
		}

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

		for(const layer of this.layers) {
			if(typeof layer.addRenderables === 'function') {
				layer.addRenderables(renderables);
			}
		}
	};


	/**
	 * Removes a renderable from this layer.
	 * @param {Renderable} renderable The renderable to remove.
	 */
	removeRenderable(renderable) {
		for(const layer of this.layers) {
			if(typeof layer.removeRenderable === 'function') {
				layer.removeRenderable(renderable);
			}
		}
	};

	/**
	 * Removes all renderables from this layer. Does not call dispose on those renderables.
	 */
	removeAllRenderables() {
		for(const layer of this.layers) {
			if(typeof layer.removeAllRenderables === 'function') {
				layer.removeAllRenderables();
			}
		}
	};


	/**
	 * Internal function for solving the visibility based on time.
	 * The element is visible when its whole range is inside the selected time range.
	 */
	solveTimeVisibility(dc, renderable) {
		for(const layer of this.layers) {
			if(typeof layer.solveTimeVisibility === 'function') {
				layer.solveTimeVisibility(dc, renderable);
			}
		}
	}
	
}

export default FootPrint;

