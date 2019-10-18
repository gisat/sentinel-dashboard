import WorldWind from 'webworldwind-gisat';
import WordWindX from 'webworldwind-x';
import Orbit from './utils/Orbit';
const {
    RenderableLayer,
    Color
} = WorldWind;

const {
    EoUtils,
} = WordWindX;

/**
 * Class extending WorldWind.RenderableLayer. It`s possible to set time of orbit.
 * @param options {Object}
 * @param options.key {String}
 * @param options.time {Date} Selected time
 * @param options.currentTime {Date} 
 * @augments WorldWind.RenderableLayer
 * @constructor
 */
class OrbitLayer extends RenderableLayer {
	constructor(options) {
        super(options);
        this._rerenderMap = null;
        this.satRec = null;
        this.key = options.key;
        this.timeWindow = 90 * 60 * 1000; //90 minutes
        this._beforeCurrentOrbit = new Orbit(EoUtils.computeSatrec(...options.satRec), new Date(), new Date(), new Color(213 / 255, 214  / 255, 210 / 255, 1));
        this._afterCurrentOrbit = new Orbit(EoUtils.computeSatrec(...options.satRec), new Date(), new Date(), new Color(1, 1, 0, 1));
        this.addRenderable(this._beforeCurrentOrbit);
        this.addRenderable(this._afterCurrentOrbit);
        this.currentTime = null;
        this.selectTime = null;
        this.endTime = null;
        this.endTime = null;
        this.satRec = null;
        this.setSatRec(options.satRec);
        this.setTime(options.currentTime, options.time);
    };

    
    /**
     * @param {Array.<lte>} satRec  Lte.
     */
    setSatRec(satRec) {
        if(satRec) {
            this.satRec = satRec;
            const satrec = EoUtils.computeSatrec(...satRec);
            this._beforeCurrentOrbit.satrec(satrec);
            this._beforeCurrentOrbit.update();
            this._afterCurrentOrbit.satrec(satrec);
            this._afterCurrentOrbit.update();
            this.doRerender();
        }
    }

    /**
     * @param {Date} time Time of the orbit.
     */
    setTime(currentTime, selectTime) {
        if(currentTime && selectTime) {
            this.currentTime = currentTime;
            this.selectTime = selectTime;

            this.startTime = new Date(selectTime.getTime() - this.timeWindow);
            this.endTime = new Date(selectTime.getTime() + this.timeWindow);

            this.removeRenderable(this._beforeCurrentOrbit);
            this.removeRenderable(this._afterCurrentOrbit);

            if(currentTime.getTime() < this.startTime.getTime()) {
                //all in future
                this._afterCurrentOrbit.time(this.startTime, this.endTime);
                this._afterCurrentOrbit.update(true);
                this.addRenderable(this._afterCurrentOrbit);
            } else if(this.startTime.getTime() < currentTime.getTime() && currentTime.getTime() < this.endTime.getTime()) {
                //select time visible
                this._beforeCurrentOrbit.time(this.startTime, currentTime);
                this._beforeCurrentOrbit.update(true);
                this._afterCurrentOrbit.time(currentTime, this.endTime);
                this._afterCurrentOrbit.update(true)

                this.addRenderable(this._beforeCurrentOrbit);
                this.addRenderable(this._afterCurrentOrbit);
            } else if(currentTime.getTime() > this.endTime.getTime()) {
                //all in past
                this._beforeCurrentOrbit.time(this.startTime, this.endTime);
                this._beforeCurrentOrbit.update(true);
                this.addRenderable(this._beforeCurrentOrbit);
            }

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

