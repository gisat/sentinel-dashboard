import WorldWind from 'webworldwind-esa';
import WordWindX from 'webworldwind-x';
const {
    RenderableLayer,
    Position,
} = WorldWind;

const {
    Model,
} = WordWindX;

/**
 * Class extending WorldWind.RenderableLayer. Layer can render only one model of satellite. It`s possible to set position data of model.
 * @param options {Object}
 * @param options.key {String}
 * @augments WorldWind.RenderableLayer
 * @constructor
 */
class SatelliteModelLayer extends RenderableLayer {
	constructor(options) {
        super(options);
        this._rerenderMap = null;
        this.key = options.key;
        this.model = null;
        this.time = options.time;
    };
    
    setModel(model) {
        if(model) {
            this.model = new Model(model, {
                rotations: {
                    x: 0,
                    y: 0,
                    z: 0,
                    headingAxis: [0, 0, 1],
                    headingAdd: -90,
                    headingMultiply: 1
                },
                preRotations: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: 500000,
                translations: {
                    x: -0.1,
                    y: -0.1,
                    z: 0
                },
                ignoreLocalTransforms: true
            }, new Position(51, 14, 100000));
            
            this.removeAllRenderables();
            this.addRenderable(this.model);
            this.doRerender();
        }
    }

    /**
     * @param position {Position} Position of the satellite.
     */
    setPosition(position) {
        if(position && this.model) {
            this.model.position(position);
        }
    }

    /**
     * @param position {Date} Time of the satellite.
     */
    setTime(time) {
        if(time) {
            this.time = time;
        }
    }
    
	setRerender(rerenderer) {
		if(typeof rerenderer === 'function') {
			this._rerenderMap = rerenderer;
		}
	}

	doRerender() {
		if(typeof this._rerenderMap === 'function') {
			this._rerenderMap();
		}
	}
}

export default SatelliteModelLayer;

