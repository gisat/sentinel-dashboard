import Distribution from './Distribution';
import Extruded from './Extruded';
import Products from './Products';
import WorldWind from 'webworldwind-esa';

import chroma from 'chroma-js';
import moment from 'moment';


const {
    RenderableLayer,
    Color,
    MeasuredLocation,
    HeatMapLayer,
} = WorldWind;

// 
// TODO - options, dispatch loading, cache layer by weeks, fix radius
// 

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
        this._products = new Products();
        this._rerenderMap = null;
        this.key = options.key;
        this.satName = options.satName;
        this.onLayerChanged = options.onLayerChanged || null;
        this.time = options.time || new Date();

        this.loading = new Set();

        this._missionScale = [
            new Color(15/255, 89/255, 69/255, 1),
            new Color(91/255, 216/255, 75/255, 1),
            new Color(24/255, 167/255, 134/255, 1),
            new Color(16/255, 125/255, 90/255, 1)
        ];
        this._instrumentsScale = [
            new Color(59/255, 15/255, 87/255, 1),
            new Color(75/255, 138/255, 216/255, 1),
            new Color(136/255, 92/255, 193/255, 1),
            new Color(91/255, 37/255, 162/255, 1)
        ];

        this._choropleth = null;
        this._extruded = null;

        this.update();
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

    getPallete(paletteKey) {
        const palettes = [
            {
                key: 'orange',
                title: 'Sequential: orange',
                colors: [chroma('rgb(255,245,235)'), chroma('rgb(253,141,60)'), chroma('rgb(127,39,4)')],
                selected: true
            },
            {
                key: 'blue',
                title: 'Sequential: blue',
                colors: [chroma('rgb(255,255,217)'), chroma('rgb(65,182,196)'), chroma('rgb(8,29,88)')]
            },
            {
                key: 'blue-orange',
                title: 'Divergent: blue-orange',
                colors: [chroma('rgb(8,48,107)'), chroma('rgb(255,255,255)'), chroma('rgb(127,39,4)')]
            },
            {
                key: 'heat',
                title: 'HeatMap: Multiple Colors',
                colors: [chroma('blue'), chroma('cyan'), chroma('lime'), chroma('yellow'), chroma('red')]
            },
            {
                key: 'blue-red',
                title: 'HeatMap: Blue Red',
                colors: [chroma('blue'), chroma('red')]
            },
            {
                key: 'white-red',
                title: 'HeatMap: White Red',
                colors: [chroma('white'), chroma('red')]
            }
        ];

         // GEt colors for missions and sensors.

        const palette = palettes.filter(function (palette) {
            return palette.key === paletteKey;
        })[0];
        return palette;
    }

    update() {

        const pallete = this.getPallete('heat');

        const options = {
            palettes: pallete,
            sensornames: ['c-sar'],
            type: 'sensors',
            opacity: 75,
            dates: ['2017-08']
        }

        return this.redraw(options).then(function (distribution) {
            let legendMap = distribution._hexs.map(function (hex, i) {
                return {
                    color: hex,
                    startValue: Math.pow(distribution.oneLevel * i, 2),
                    endValue: Math.pow(distribution.oneLevel * (i + 1), 2)
                };
            });

            return legendMap;
        }).catch(function (err) {
            console.error(err);
        });
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

    // Documented in superclass.
	doRender(dc) {
		if(this._choropleth && typeof this._choropleth.doRender === 'function'){
            this._choropleth.doRender(dc);
        };

		if(this._extruded && typeof this._extruded.doRender === 'function'){
            this._extruded.doRender(dc);
        };
	}

    /**
     * It removes currently displayed layers with actually valid information and creates new layers with the
     * information needed for user to understand the state.
     * Example:
     * {
     *   sensornames: ['c-sar'],
     *   type: 'sensors',
     *   opacity: 100,
     *   dates: ['2017-08']
     * }
     *
     * @param options {Object}
     * @param options.type {String} mission or sensors
     * @param options.dates {String[]} Array of dates in the format YYYY-MM
     * @param options.spacecraftnames {String[]} Array of the names of the spacecrafts to be used.
     * @param options.sensornames {String[]} Array of the names of the sensors to be used.
     * @param options.showExtrudedPolygons {Boolean} Whether the extruded polygons should be displayed
     * @param options.opacity {Number} 0 to 100
     */
    redraw(options) {
        if(!options || (options.type !== 'missions' && options.type !== 'sensors' )) {
            return;
        }

        let dataToDownload = null
        let colorScale = null;
        if (options.type === 'missions') {
            dataToDownload = options.spacecraftnames;
            colorScale = this._missionScale;
        } else if (options.type === 'sensors') {
            dataToDownload = options.sensornames;
            colorScale = this._instrumentsScale;
        }

        let chosenMonths = options.dates.map(function (date) {
            // date which needs to be updated.
            return moment(date);
        }); // This must return arrays of available months.
        let allPromises = [];

        // Combinations of datasets and months.
        // It is necessary to make sure that the promises are correctly handled.
        dataToDownload.forEach((dataset, index) => {
            chosenMonths.forEach((chosenMonth) => {
                allPromises.push(this._products.retrieve(
                    dataset,
                    chosenMonth.format('YYYY'),
                    chosenMonth.format('MM'),
                    colorScale[index]
                ));
            });
        });

        return Promise.all(allPromises).then((products) => {
            let legend = this.aggregateAndFilter(options, [].concat(...products));

            return legend;
        });
    }

    /**
     * It gets grid of the products and aggregates and filters it.
     * @param options {Object}
     * @param products
     */
    aggregateAndFilter(options, products) {
        this._choropleth = this.getChoropleth(products, options);

        if (options.showExtrudedPolygons) {
            this._extruded = this.getExtruded(products);
        }

        return this._choropleth.distribution;
    }

    // Move to the relevant layers.

    /**
     * It returns newly created Choropleth for currently chosen products.
     * @param products {AggregatedProduct[]} Collection of the products to be displayed in the choropleth.
     * @param options {Object}
     * @returns {HeatMapLayer} Layer representing choropleth with the passed in Products.
     */
    getChoropleth(products, options) {
        console.log(HeatMapLayer)
        debugger
        let heatMap = new HeatMapLayer('Product Statistics', products.map(function (product) {
            return new MeasuredLocation(
                product.latitude,
                product.longitude,
                product.amount
            );
        }), 1);

        let distribution = new Distribution({
            opacity: 1,
            palettes: options.palettes,
            max: heatMap._max
        });

        heatMap.distribution = distribution;
        heatMap.scale = distribution._hexs;
        heatMap.opacity = options.opacity && options.opacity / 100 || 0.75;
        // heatMap.radius = function (sector) {
        //     if (sector.maxLongitude - sector.minLongitude >= 45) {
        //         return 25;
        //     } else if (sector.maxLongitude - sector.minLongitude >= 22.5) {
        //         return 37.5;
        //     } else if (sector.maxLongitude - sector.minLongitude >= 11.125) {
        //         return 50;
        //     } else if (sector.maxLongitude - sector.minLongitude >= 5.5) {
        //         return 62.5;
        //     }

        //     return 75;
        // };

        return heatMap;
    }

    /**
     * It returns newly created Extruded layer for either currently chosen mission or sensor. It is responsibility
     * of this layer to choose, whether it displays Sensor or Mission and update accordingly.
     * @param products {AggregatedProduct[]} Collection of the products to be displayed as extruded polygons.
     * @returns {Extruded} Layer representing shares displayed by differently colored extruded polygons.
     */
    getExtruded(products) {
        // The relevant part is in colors.
        return new Extruded({
            name: 'Analytics Extruded Layer Missions.',

            products: products
        });
    }
}

export default StatisticsLayer;

