import { createSelector } from 'reselect'
import moment from 'moment';
import common from '../_common';
import {getCurrentTime} from '../rootSelectors';

// export const addItemToIndex = (array, index, item) => [...array.slice(0, index), item, ...array.slice(index)];
// export const removeItemByIndex = (array, index) => [...array.slice(0, index), ...array.slice(index + 1)];

const getSubstate = (state) => common.getByPath(state, ['components', 'search']);
const getActiveResultIndex = (state) => common.getByPath(state, ['components', 'search', 'activeResultIndex']);
const getResults = (state) => common.getByPath(state, ['components', 'search', 'results']);
const getFilterTime = (state) => common.getByPath(state, ['components', 'search', 'filterTime']);

const getSearchLayer = (state) => {
    const activeResultIndex = getActiveResultIndex(state);
    const results = getResults(state);
    if(Number.isInteger(activeResultIndex) && results && results.length > 0 && activeResultIndex <= results.length) {
        return results[activeResultIndex];
    } else {
        return null;
    }
}

export {
    getActiveResultIndex,
    getFilterTime,
    getResults,
    getSubstate,
    getSearchLayer,
}