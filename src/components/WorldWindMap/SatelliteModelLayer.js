import WorldWind from 'webworldwind-gisat';
import WordWindX from 'webworldwind-x';
const {
    RenderableLayer,
    Position,
} = WorldWind;

const {
    Model,
    EoUtils,
} = WordWindX;

const DEFAULT_MODEL_OPTIONS = {
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
}

/**
 * Class extending WorldWind.RenderableLayer. Layer can render only one model of satellite. It`s possible to set position data of model.
 * @param options {Object}
 * @param options.key {String}
 * @param options.time {Date} Time of the satellite.
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
        this.Tle = null;
    };
    
    /**
     * 
     * @param {Object} collada model 
     * @param {Object} options
     * @param {Position} position
     */
    setModel(model, options = DEFAULT_MODEL_OPTIONS, position) {
        if(model) {
            this.model = new Model(model, options, position);
            
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
     * @param position {Array.<lte>} Lte.
     */
    setTle(Tle) {
        if(Tle) {
            this.Tle = Tle;
            this.update();
        }
    }
    
    /**
     * @param position {Array.<lte>} Lte.
     */
    update() {
        if(this.Tle && this.time) {
            const satrec = EoUtils.computeSatrec(...this.Tle);
            const position = EoUtils.getOrbitPosition(satrec, new Date(this.time));
            this.setPosition(new Position(position.latitude, position.longitude, position.altitude));
            this.doRerender();
        }
    }

    /**
     * @param time {Date} Time of the satellite.
     */
    setTime(time) {
        if(time) {
            this.time = time;
            this.update();
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

