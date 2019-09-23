import WorldWind from 'webworldwind-gisat';
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
        this.satRec = null;
        this.key = options.key;
        const timeWindow = 2 * 90 * 60 * 1000;
        this.orbit = new Orbit(EoUtils.computeSatrec(...options.satRec), new Date(), timeWindow);
        this.addRenderable(this.orbit);
        this.time = null;
        this.satRec = null;
        this.setSatRec(options.satRec);
        this.setTime(options.time);
    };

    
    /**
     * @param {Array.<lte>} satRec  Lte.
     */
    setSatRec(satRec) {
        if(satRec) {
            this.satRec = satRec;
            const satrec = EoUtils.computeSatrec(...satRec);
            this.orbit.satrec(satrec);
            this.orbit.update();
            this.doRerender();
        }
    }

    /**
     * @param {Date} time Time of the orbit.
     */
    setTime(time) {
        if(time) {
            this.time = time;
            this.orbit.time(time);
            this.orbit.update(true);
            // this.orbit.update();
            this.doRerender();
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

