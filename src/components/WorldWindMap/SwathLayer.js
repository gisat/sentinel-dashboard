import WorldWind from 'webworldwind-esa';
import WordWindX from 'webworldwind-x';
import utils from './utils/eo/utils';
const {
    RenderableLayer,
    Color,
} = WorldWind;

const {
    SwathCone
} = WordWindX;

const getParams = (satName, type) => {

    let translateDistance = null;

    //swath width - so that the swath is the same width as the acq plan
    let swathWidth;

    //controls how big the swath is, higher values means a smaller swath
    const swathHeight = 35;

    if (satName === 's1a' || satName === 's1b') {
        if (type === 'IW') {
            //red
            translateDistance = 490;
            swathWidth = 130;
        }
        else if (type === 'EW') {
            //green
            translateDistance = 435;
            swathWidth = 210;
        }
        else if (type === 'SM') {
            //black
            translateDistance = 308;
            swathWidth = 41;
        }
        else {
            return;
        }
    }
    else if (satName === 's2a' || satName === 's2b') {
        swathWidth = 145;
        translateDistance = undefined;
    }

    return {
        swathWidth,
        swathHeight,
        translateDistance,
    }
}

/**
 * Class extending WorldWind.RenderableLayer. Layer can render only one model of satellite. It`s possible to set position data of model.
 * @param options {Object}
 * @param options.key {String}
 * @param options.time {String}
 * @param options.tle {String}
 * @augments WorldWind.RenderableLayer
 * @constructor
 */
class SwathLayer extends RenderableLayer {
	constructor(options) {
        super(options);
        this._rerenderMap = null;
        this.key = options.key;
        this.satName = options.satName;
        this.time = options.time;
        this.Tle = options.tle;
        this.swath = null;
        this.type = null;
        this.color = Color.RED;
    };

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
     * @param type {string}
     */
    setType(type) {
        const update = this.type !== type;
        if(type) {
            this.type = type;

            if(update) {
                this.update();
            }
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


    /**
     * @param time {Date} Time of the satellite.
     */
    setVisible(visible) {
        const update = this.visible !== visible;
        if(visible === true) {
            this.visible = true;
        } else {
            this.visible = false;
        }

        if(update) {
            this.update();
        }
    }

    /**
     * @param time {Date} Time of the satellite.
     */
    update() {
        this.removeAllRenderables();
        if(this.visible && this.time && this.Tle && this.type) {
            const satRec = utils.computeSatrec(...this.Tle);

            const currentPosition = utils.getOrbitPosition(satRec, this.time);
            
            const nextPosition = utils.getOrbitPosition(satRec, new Date(this.time.getTime() + 10000));
            const nNextPosition = utils.getOrbitPosition(satRec, new Date(this.time.getTime() + 20000));
            const headingRad = utils.headingAngleRadians(currentPosition.latitude, currentPosition.longitude, nextPosition.latitude, nextPosition.longitude);
            const currentHeading = utils.rad2deg(headingRad);
            const nextHeadingRad = utils.headingAngleRadians(nextPosition.latitude, nextPosition.longitude, nNextPosition.latitude, nNextPosition.longitude);
            const nextHeading = utils.rad2deg(nextHeadingRad);

            const {swathWidth, swathHeight, translateDistance} = getParams(this.satName, this.type);
            if(swathWidth && swathHeight) {
                this.swath = new SwathCone({
                    currentPosition,
                    nextPosition,
                    currentHeading,
                    nextHeading
                }, this.color, translateDistance, swathWidth, swathHeight);
    
                this.addRenderable(this.swath);
            }
        }
        this.doRerender();
    }
    
	setRerender(rerenderer) {
		if(typeof rerenderer === 'function') {
			this._rerenderMap = rerenderer;
		}
	}
    
	setColor(color) {
        const update = this.color !== color;
        if(color) {
            this.color = color;

            if(update) {
                this.update();
            }
        }
	}

	doRerender() {
		if(typeof this._rerenderMap === 'function') {
			this._rerenderMap();
		}
	}
}

export default SwathLayer;

