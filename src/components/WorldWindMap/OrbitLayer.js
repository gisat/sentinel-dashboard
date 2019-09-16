import WorldWind from 'webworldwind-esa';
import WordWindX from 'webworldwind-x';
const {
    RenderableLayer,
} = WorldWind;

const {
    Orbit,
    EoUtils,
} = WordWindX;

/**
 * Class extending WorldWind.RenderableLayer. It`s possible to set time of orbit.
 * @param options {Object}
 * @param options.key {String}
 * @augments WorldWind.RenderableLayer
 * @constructor
 */
class OrbitLayer extends RenderableLayer {
	constructor(options) {
        super(options);
        this._rerenderMap = null;
        this.key = options.key;
        this.orbit = new Orbit(EoUtils.computeSatrec(...options.satRec));
        this.addRenderable(this.orbit);
        this.time = null;
        this.setSatRec(options.satRec);
        this.setTime(options.time);
    };

    
    /**
     * @param position {Array.<lte>} Lte.
     */
    setSatRec(satRec) {
        if(satRec) {
            const satrec = EoUtils.computeSatrec(...satRec);
            this.orbit.satrec(satrec);
        }
    }

    /**
     * @param position {Date} Time of the orbit.
     */
    setTime(time) {
        if(time) {
            this.time = time;
            this.orbit.time(time);
            // this.orbit.update(true);
            this.orbit.update();
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

export default OrbitLayer;

