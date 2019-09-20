import WorldWind from 'webworldwind-gisat';
import WordWindX from 'webworldwind-x';
import KMLWorker from './utils/KML.worker'
import {AcquisitionPlansParser} from './utils/AcquisitionPlansParser'

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
 * @param options.range {number} Renge in milliseconds.
 * @augments WorldWind.RenderableLayer
 * @constructor
 */
class AcquisitionPlanLayer extends RenderableLayer {
	constructor(options) {
        super(options);
        this._rerenderMap = null;
        this.key = options.key;
        this.satName = options.satName;
        this.plans = null;
        this.time = options.time || new Date();

        this.range = options.range || 90 * 60 * 1000;
        this.loading = new Set();
    };

	async setPlans(plans, startDate, endDate) {
        this.plans = plans;
        this.update();
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

    async update() {
        //TODO - call loading callback
        this.removeAllRenderables();
        this.doRerender();
        const updateId = generateId();

        //filter plans by acquisitionPlans.cache
        
        const startDate = new Date(this.time - this.range);
        const endDate = new Date(this.time + this.range);
        // await Promise.all(this.plans.map(plan => acquisitionPlans.parse({...plan, filterDate: startDate.toISOString()}).catch((err) => {console.error(err)})));
        const filteredPlans = filterPlansByUrl(this.plans, acquisitionPlans.cache[this.satName]);

        //if already loading, then remove from plans
        const unloadedPlans = filteredPlans.filter(plan => ![...this.loading].some((pHash) => `${pHash.split('.kml_')[0]}.kml` === plan.url));

        //add loading urls
        filteredPlans.forEach(plan => this.loading.add(`${plan.url}_${updateId}`));

        //dont filter in cache
        await Promise.all(unloadedPlans.map(plan => acquisitionPlans.parse({...plan, filterDate: getDate(plan.start).toISOString()}).catch((err) => {console.error(err)})));
        
        //remove loading urls
        filteredPlans.forEach(plan => this.loading.delete(`${plan.url}_${updateId}`));

        acquisitionPlans.terminateWorkers();
        const { interiors, outlines } = acquisitionPlans.getFootprints({ satName: this.satName, startDate , endDate });

        this.addRenderables(interiors);
        this.addRenderables(outlines);

        this.doRerender();
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

export default AcquisitionPlanLayer;

