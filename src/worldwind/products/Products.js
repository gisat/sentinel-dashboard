import moment from 'moment';
import Product from './Product';
import Query from './Query';
import {xml2js} from 'xml-js';

const getProductsInTime = (products, startDate, endDate) => {
    const startDateMoment = moment.utc(startDate);
    const endDateMoment = moment.utc(endDate);

    return products.filter((product) => {
        const metadata = product.metadata();
        const beginpositionDate = metadata.date.find((d) => {
            return d._attributes.name === 'beginposition'
        })
        const beginposition = beginpositionDate && beginpositionDate._text && moment.utc(beginpositionDate._text)

        const endpositionDate = metadata.date.find((d) => {
            return d._attributes.name === 'endposition'
        })
        const endposition = endpositionDate && endpositionDate._text && moment.utc(endpositionDate._text)

        return beginposition.isBetween(startDateMoment, endDateMoment) || endposition.isBetween(startDateMoment, endDateMoment)
    });
}

const getCacheID = (shortName, products, location, hour) => {
    return `${shortName}-${products}-${location}-${hour}`;
}

export const parseEntry = (entry) => {
    if(entry && entry.id) {
        const parsedEntry = {
            title:{...entry.title},
            link:[...entry.link],
            id:{...entry.id},
            summary:{...entry.summary},
            date:[...entry.date],
        };

        parsedEntry.id = entry.id._text;

        const str = {};
        entry.str.forEach(element => {
            const name = element._attributes.name;
            str[name] = element._text;
        });
        parsedEntry.str = str;

        parsedEntry.link = entry.link.map(element => {
            return {
                rel: element._attributes.rel,
                href: element._attributes.href
            };
        });
        return parsedEntry;
    } else {
        return null;
    }
}

export default class Products {
    /**
     * Products represents collection of the products from different satellites. The Query is focused on the SciHub.
     * @param cache {Map} Cache to be used for storing the retrieved products.
     * @param fetch {Function} Function with provided defaults for making requests.
     * @param baseUrl {String} Optional. Optional URL for the retrieval of the products. Default is SciHub
     */
    constructor(cache, searchCache, fetch, baseUrl = 'https://scihub.copernicus.eu/apihub/search') {
        this._baseUrl = baseUrl;
        this._cache = cache;
        this._searchCache = searchCache;

        this._fetch = fetch;
    }

    parseSearchResults(hours, beginTime, endTime) {
        let filteredProducts = [];
        for(const [key, value] of hours.entries()) {
            const processed = this.processProducts(value);
            filteredProducts = [...filteredProducts, ...processed];
        };
        return getProductsInTime(filteredProducts, beginTime, endTime)
    }

    loadSearch(hours, shortName, products, location) {
        // load unloaded hour
        for(const [hour, search] of hours.entries()) {
            if(!search) {
                const hourLoader = this.loadSearchByHour(shortName, products, location, hour);
                hours.set(hour, hourLoader);
            }
        };

        //wait until all hours loads
        const promises = []
        for(const [hour, search] of hours.entries()) { 
            const isPromise = typeof search.then === 'function';
            if(isPromise) {
                promises.push(search);
            }
        };

        return Promise.all(promises).then(searchResults => {
            for (const result of searchResults) {
                this._searchCache.set(getCacheID(shortName, products, location, result.hour), result.search);
                hours.set(result.hour, result.search);
            }
            return searchResults;
        });
    }

    getChachedSearch(hours, shortName, products, location) {
        // get hours from cache
        for(const hour of hours.keys()) {
            hours.set(hour, this._searchCache.get(getCacheID(shortName, products, location, hour)));
        };
    }

    /**
     * Retrieve the product information from the SciHub. The process has two parts.
     *   The first part is retrieving the products available for given combination of the parameters.
     *   The second part is to retrieve the actual quicklooks for all the products not already stored in cache.
     * @param shortName {String} Short name of the satellite for which to query the data.
     * @param products {String[]} Array of the products to query for.
     * @param location {Object} Latitude, Longitude of specific point.
     * @param beginTime {Date} From when we want the data
     * @param endTime {Date} Until when we want the data
     * @returns {Promise<Product[]>} Product for further use.
     */
    async products({shortName, products = [], location, beginTime, endTime} = {}) {
        const momentBeginTime = moment.utc(beginTime).startOf('hour');
        const momentEndTime = moment.utc(endTime).endOf('hour');
        const diff = momentEndTime.diff(momentBeginTime);
        const duration = moment.duration(diff);
        const durationInHours = Math.ceil(duration.asHours());

        const hours = new window.Map();
        for (let i = 0; i < durationInHours; i++) {
            const time = moment.utc(momentBeginTime).add(i, 'hour');
            hours.set(time.format('YYYY-MM-DD-HH'));
        }

        this.getChachedSearch(hours, shortName, products, location);

        return this.loadSearch(hours, shortName, products, location).then((results) => {
            const hoursString = [...hours.keys()].sort();
            const firstHour = hoursString[0];
            const lastHour = hoursString[hoursString.length - 1];
            const beforeFirstHour = moment.utc(firstHour, 'YYYY-MM-DD-HH').subtract(1, 'hour').startOf('hour').format('YYYY-MM-DD-HH');
            const afterLastHour = moment.utc(lastHour, 'YYYY-MM-DD-HH').add(1, 'hour').startOf('hour').format('YYYY-MM-DD-HH');

            const marginHours = new window.Map();
            marginHours.set(beforeFirstHour);
            marginHours.set(afterLastHour);

            this.getChachedSearch(marginHours, shortName, products, location);
            this.loadSearch(marginHours, shortName, products, location)
            return this.parseSearchResults(hours, beginTime, endTime)
        })
    }

    /**
     * Retrieve the product information from the SciHub. The process has two parts.
     *   The first part is retrieving the products available for given combination of the parameters.
     *   The second part is to retrieve the actual quicklooks for all the products not already stored in cache.
     * @param shortName {String} Short name of the satellite for which to query the data.
     * @param products {String[]} Array of the products to query for.
     * @param location {Object} Latitude, Longitude of specific point.
     * @param beginTime {Date} From when we want the data
     * @param endTime {Date} Until when we want the data
     * @returns {Promise<Product[]>} Product for further use.
     */
    async loadSearchByHour(shortName, products, location, hour) {
        const beginTime = moment.utc(hour, 'YYYY-MM-DD-HH').startOf('hour');
        const endTime = moment.utc(hour, 'YYYY-MM-DD-HH').endOf('hour');
        const resultsPerPage = 100;
        let startIndex = 0;
        let currentPage;
        do {
            currentPage = await this.load({shortName, products, location, beginTime: beginTime.toDate(), endTime: endTime.toDate(), startIndex});
            startIndex += resultsPerPage;

            // const processed = this.processProducts(currentPage);
            // filteredProducts.push.apply(filteredProducts, processed);
        } while(currentPage.next);

        return {
            hour,
            search: currentPage
        };
    }

    /**
     * Retrieve the product information from the SciHub. The process has two parts.
     *   The first part is retrieving the products available for given combination of the parameters.
     *   The second part is to retrieve the actual quicklooks for all the products not already stored in cache.
     * @param shortName {String} Short name of the satellite for which to query the data.
     * @param products {String[]} Array of the products to query for.
     * @param location {Object} Latitude, Longitude of specific point.
     * @param beginTime {Date} From when we want the data
     * @param endTime {Date} Until when we want the data
     * @returns {Promise<Object>}
     *   errors contains array of errors happening during creation of the renderables.
     *   total represents the total amount of products
     *   renderables the renderables tobe displayed
     */
    async renderables({shortName, products = [], location, beginTime, endTime} = {}) {
        const productsLocal = await this.products({shortName, products, location, beginTime, endTime});
        const renderables = [];
        const errors = [];
        for(let productIndex = 0; productIndex < productsLocal.length; productIndex++) {
            try {
                const renderable = await productsLocal[productIndex].renderable();
                if(renderable.error) {
                    errors.push(renderable.error);
                }
                renderables.push(renderable);
            } catch(e) {
                console.log('Products#renderables', e);
                errors.push(e);
            }
        }
        return {
            errors: errors,
            renderables: renderables,
            total: productsLocal.length
        };
    }

    /**
     * From the entries received from Sci Hub creates relevant products with all necessary information for further
     * processing and visualization.
     * @private
     * @param feed {Object} Atom feed with the information about the products.
     * @returns {Array<Product>} Valid products
     */
    processProducts(feed) {
        if(feed.entry && feed.entry.length > 0) {
            return feed.entry.map(entry => {
                const parsedEntry = parseEntry(entry);
                if(parsedEntry && parsedEntry.id) {
                    const id = parsedEntry.id;
                    const cached = this._cache.get(id);
                    if(!cached) {
                        const product = new Product(this._fetch, parsedEntry);
                        this._cache.set(product.id(), product);
                        return product;
                    } else {
                        return cached;
                    }
                } else {
                    return null;
                }
            }).filter(product => product);
        } else {
            return [];
        }
    }

    /**
     * Load feed with the products from the remote source.
     * @private
     * @param shortName {String} Short name of the satellite for which to query the data.
     * @param products {String[]} Array of the products to query for.
     * @param location {Object} Latitude, Longitude of specific point.
     * @param beginTime {Date} From when we want the data
     * @param endTime {Date} Until when we want the data
     * @param startIndex {Number} The index of the first result to query for.
     * @returns {Promise<Object>} Feed from the response.
     */
    async load({shortName, products = [], location, beginTime, endTime, startIndex} = {}) {
        //tady seskládat 
        const query = new Query({shortName, products, location, beginTime, endTime, startIndex});
        const url = this._baseUrl + query.url();

        const cached = this._cache.get(url);
        if(cached) {
            
            return JSON.parse(cached);
        }

        try {
            const response = await this._fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            const atomFeed = await response.text();

            
            const root = xml2js(atomFeed, {compact: true});
            const feed = root.feed;
            if(feed.entry && typeof feed.entry.length === 'undefined') {
                feed.entry = [feed.entry];
            }

            // Here it is necessary to decide whether there are more results.
            const totalResults = Number(feed['opensearch:totalResults']._text);
            const itemsPerPage = Number(feed['opensearch:itemsPerPage']._text);

            feed.next = (startIndex + itemsPerPage) < totalResults;
            this._cache.set(url, JSON.stringify(feed));
            return feed;
        } catch (error) {
            throw (new Error('Error in loading products list'));
        }
    }
}