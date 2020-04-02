import WorldWind from 'webworldwind-esa';
import WordWindX from 'webworldwind-x';
import KMLWorker from './utils/KML.worker'
import {AcquisitionPlansParser} from './utils/AcquisitionPlansParser'
import TexturedSurfacePolygon from "../../worldwind/textured/TexturedSurfacePolygon";

const {
    RenderableLayer,
} = WorldWind;

const {
    Workers,
    AcquisitionPlans,
} = WordWindX;

const satNames = ['s1a', 's1b', 's2a', 's2b'];
const numWorkers = Workers.getCoreCount();
const workers = new Workers(KMLWorker, numWorkers);
const acquisitionPlans = new AcquisitionPlans(satNames, workers);
acquisitionPlans.parser = new AcquisitionPlansParser(workers);
acquisitionPlans.parser.InteriorCtor = TexturedSurfacePolygon;

/**
 * 
 * @param {string} dateString - Datestring like 20190430 with fixed width.
 */
const getDate = (dateString) => {
    return new Date(`${dateString.substr(0,4)}-${dateString.substr(4,2)}-${dateString.substr(6,2)}`);
}

const filterPlansByUrl = (plans, cachedPlans) => {
    return plans.filter((plan) => {
        return !cachedPlans.some(cachedPlan => cachedPlan.url === plan.url);
    })
}

const generateId = () => {
    return window.crypto.getRandomValues(new Uint32Array(1))[0];
}

/**
 * Class extending WorldWind.RenderableLayer. Layer can render only one model of satellite. It`s possible to set position data of model.
 * @param options {Object}
 * @param options.key {String}
 * @param options.satName {String}
 * @param options.time {Date} Time of the satellite.
 * @param options.range {number} Renge in milliseconds. Default is 90 minutes.
 * @param options.onLayerChanged {func}
 * @augments WorldWind.RenderableLayer
 * @constructor
 */
class StatisticsLayer extends RenderableLayer {
	constructor(options) {
        super(options);
        this._rerenderMap = null;
        this.key = options.key;
        this.satName = options.satName;
        this.onLayerChanged = options.onLayerChanged || null;
        this.time = options.time || new Date();

        this.loading = new Set();
    };

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

export default StatisticsLayer;

