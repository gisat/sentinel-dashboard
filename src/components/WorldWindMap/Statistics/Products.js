import config from './config';
import moment from 'moment';
import WorldWind from 'webworldwind-esa';
const {
    Logger
} = WorldWind;


/**
 * Store containing all already received products. These products are stored for further usage in the Cache.
 * @constructor
 * @augments BaseStore
 */
class Products {
    constructor() {
        this._url = config.apiUrl + config.missionTemplate;
        this._cache = {};
    }

    /**
     * Retrieve all products valid for certain combination of mission, instrument, year and month.
     * @param mission {String} Code of the mission
     * @param year {String} Year of the acquisition
     * @param month {String} Month of the acquisition
     * @param color {Color} Color used to display the information in extruded version.
     */
    retrieve(mission, year, month, color) {
        Logger.logMessage(Logger.LEVEL_INFO, 'Products', 'retrieve', `Retrieve products for mission ${mission} on ${year}-${month}`);
        if (this._cache[mission] && this._cache[mission][year] && this._cache[mission][year][month]) {
            Logger.logMessage(Logger.LEVEL_INFO, 'Products', 'retrieve', `Retrieved ${this._cache[mission][year][month].length}} of products from cache`);

            return Promise.resolve(this._cache[mission][year][month]);
        }

        this.prepareCache(mission, year);

        let url = `${config.apiUrl}${mission}/${year}/${month}.json`;
        let self = this;
        return this.ajax(url, {responseType: 'json'}).then(content => {
            let models = self.parseProductsFromRemote(content, {mission: mission, color: color}); // The mission should already contain the color of the mission.
            Logger.logMessage(Logger.LEVEL_INFO, 'Products', 'retrieve', `Caching ${models.length} of products  for ${mission} on ${year}-${month}`);

            self._cache[mission][year][month] = models;

            return models;
        }).catch(() => {
            Logger.logMessage(Logger.LEVEL_INFO, 'Products', 'retrieve', `No models available for ${mission} on ${year}-${month}`);

            return [];
        });
    }

    /**
     * Parses products received from the Remote API into models we internally understand.
     * @param content {String} JSON response from the server containing the products.
     * @param mission {Object} Mission name and  Color used to display the information in extruded version.
     * @returns {AggregatedProduct[]} Information about amount of products acquired on given location.
     * @private
     */
    parseProductsFromRemote(content, mission) {
        let products = content.boxes;
        Logger.logMessage(Logger.LEVEL_INFO, 'Products', 'retrieve', 'Retrieved ' + products.length + ' of products' +
            ' from remote API. ');

        let models = [];
        products.forEach(function (product) {
            models.push({
                latitude: (Number(product.bbox2Lat) + Number(product.bbox1Lat)) / 2,
                longitude: (Number(product.bbox2Lon) + Number(product.bbox1Lon)) / 2,
                mission: mission,
                amount: Number(product.amount),
                acquisitionMoment: moment(product.year + '-' + product.month)
            });
        });

        return models;
    }

    prepareCache(mission, year) {
        if (!this._cache[mission]) {
            this._cache[mission] = [];
        }
        if (!this._cache[mission][year]) {
            this._cache[mission][year] = [];
        }
    }

    ajax(url, options) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();

            xhr.open('GET', url, true);
            if (options.responseType) {
                xhr.responseType = options.responseType;
            }
            xhr.onreadystatechange = (function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(this.response);
                    }
                    else {
                        Logger.log(Logger.LEVEL_WARNING,
                            'File retrieval failed (' + xhr.statusText + '): ' + url);
                        reject();
                    }
                }
            });

            xhr.onerror = (function () {
                Logger.log(Logger.LEVEL_WARNING, 'Remote file retrieval failed: ' + url);

                reject();
            }).bind(this);

            xhr.ontimeout = (function () {
                Logger.log(Logger.LEVEL_WARNING, 'Remote file retrieval timed out: ' + url);

                reject();
            }).bind(this);

            xhr.send(null);
        });
    }
}

export default Products;