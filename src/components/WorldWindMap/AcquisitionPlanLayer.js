import WorldWind from 'webworldwind-gisat';
import WordWindX from 'webworldwind-x';
const {
    RenderableLayer,
} = WorldWind;

const {
    Workers,
    AcquisitionPlans,
    KMLWorker
} = WordWindX;

const satNames = ['s1a', 's1b', 's2a', 's2b'];
const numWorkers = Workers.getCoreCount();
const workers = new Workers(KMLWorker, numWorkers);
const acquisitionPlans = new AcquisitionPlans(satNames, workers);

/**
 * Class extending WorldWind.RenderableLayer. Layer can render only one model of satellite. It`s possible to set position data of model.
 * @param options {Object}
 * @param options.key {String}
 * @augments WorldWind.RenderableLayer
 * @constructor
 */
class AcquisitionPlanLayer extends RenderableLayer {
	constructor(options) {
        super(options);
        this._rerenderMap = null;
        this.key = options.key;
        this.plans = null;
    };

	async setPlans(plans, startDate, endDate) {
        this.plans = plans;
        console.log("set plans", plans);

        await Promise.all(plans.map(plan => acquisitionPlans.parse(plan).catch((err) => {console.error(err)})));

        // acquisitionPlans.terminateWorkers();
        const { interiors, outlines } = acquisitionPlans.getFootprints({ satName: this.displayName.satName, startDate, endDate });

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

