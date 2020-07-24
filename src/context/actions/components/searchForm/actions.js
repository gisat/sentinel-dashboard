import SciHubProducts from '../../../../worldwind/products/Products';
import {hubPassword, hubUsername, sciHubUrl} from "../../../../config";
import types from '../../../types';
import {setComponent} from '../../../actions';

const searchCache = new window.Map();
const csiRenderablesCache = new window.Map();
const productsScihub = new SciHubProducts(csiRenderablesCache, searchCache, fetchWithCredentials, sciHubUrl);

function fetchWithCredentials (url, options = {}) {
    if (!options.headers) {
        options.headers = {};
    }
    options.headers.Authorization = `Basic ${window.btoa(`${hubUsername}:${hubPassword}`)}`;

    const fetch = window.fetch(url, options);
    return fetch;
};

export const loadLatestProducts = async (shortName, products, location, beginTime, endTime, startIndex) => {
    const feed = await productsScihub.load({shortName, products, location, beginTime, endTime, startIndex});
    if(feed.entry && feed.entry.length > 0) {
        return feed.entry
    } else {
        return null
    }
};

export const setSearchResults = (results) => {
    return {
        type: types.COMPONENT.SET,
        component: 'search',
        path: 'results',
        value: results,
    };
};

export const setSearchTime = (time) => {
    return {
        type: types.COMPONENT.SET,
        component: 'search',
        path: 'filterTime',
        value: time,
    };
};

export const setActiveResultIndex = (index) => {
    return {
        type: types.COMPONENT.SET,
        component: 'search',
        path: 'activeResultIndex',
        value: index,
    };
};

export const setGeometry = (geometry) => {
    return {
        type: types.COMPONENT.SET,
        component: 'search',
        path: 'geometry',
        value: geometry,
    };
};

export const resetSearchComponent = (dispatch) => {
    dispatch(setSearchResults([]));
    dispatch(setSearchTime(null));
    dispatch(setActiveResultIndex(null));
    dispatch(setGeometry(null));
};