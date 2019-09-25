import WorldWind from 'webworldwind-gisat';
import WordWindX from 'webworldwind-x';
import utils from './utils/eo/utils';
const {
    RenderableLayer,
    Color,
} = WorldWind;

const {
    Swath
} = WordWindX;

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
        this.time = options.time;
        this.Tle = options.tle;
        this.swath = null;
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
        if(visible === true) {
            this.visible = true;
        } else {
            this.visible = false;
        }
        this.update();
    }

    /**
     * @param time {Date} Time of the satellite.
     */
    update() {
        this.removeAllRenderables();
        if(this.visible && this.time && this.Tle) {
            const satRec = utils.computeSatrec(...this.Tle);

            const currentPosition = utils.getOrbitPosition(satRec, this.time);
            console.log(currentPosition);
            
            const nextPosition = utils.getOrbitPosition(satRec, new Date(this.time + 10000));
            const nNextPosition = utils.getOrbitPosition(satRec, new Date(this.time + 20000));
            const headingRad = utils.headingAngleRadians(currentPosition.latitude, currentPosition.longitude, nextPosition.latitude, nextPosition.longitude);
            const currentHeading = utils.rad2deg(headingRad);
            const nextHeadingRad = utils.headingAngleRadians(nextPosition.latitude, nextPosition.longitude, nNextPosition.latitude, nNextPosition.longitude);
            const nextHeading = utils.rad2deg(nextHeadingRad);

            this.swath = new Swath({
                currentPosition,
                nextPosition,
                currentHeading,
                nextHeading
                //fixme - translateDistance, swathWidth, swathHeight
            }, this.color, 490, 130, 35);

            this.addRenderable(this.swath);
        }
        this.doRerender();
    }
    
	setRerender(rerenderer) {
		if(typeof rerenderer === 'function') {
			this._rerenderMap = rerenderer;
		}
	}
    
	setColor(color) {
        this.color = color;
	}

	doRerender() {
		if(typeof this._rerenderMap === 'function') {
			this._rerenderMap();
		}
	}
}

export default SwathLayer;

