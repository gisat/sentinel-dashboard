import SciHubProducts from '../../../../worldwind/products/Products';
import {hubPassword, hubUser} from "../../../../config";

const searchCache = new window.Map();
const csiRenderablesCache = new window.Map();

const productsScihub = new SciHubProducts(csiRenderablesCache, searchCache, fetchWithCredentials);

function fetchWithCredentials (url, options = {}) {
    if (!options.headers) {
        options.headers = {};
    }
    options.headers.Authorization = `Basic ${window.btoa(`${hubUser}:${hubPassword}`)}`;

    const fetch = window.fetch(url, options);
    return fetch;
};

export const search = (coordinates, satellite, layers) => {
    await productsScihub.load({shortName, products, location, beginTime: beginTime.toDate(), endTime: endTime.toDate(), startIndex})
    // currentPage = await this.load({shortName, products, location, beginTime: beginTime.toDate(), endTime: endTime.toDate(), startIndex});
}