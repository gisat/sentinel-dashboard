import { createSelector } from 'reselect'
import moment from 'moment';
import common from '../_common';
import {getCurrentTime} from '../rootSelectors';

// export const addItemToIndex = (array, index, item) => [...array.slice(0, index), item, ...array.slice(index)];
// export const removeItemByIndex = (array, index) => [...array.slice(0, index), ...array.slice(index + 1)];

const getSubstate = (state) => common.getByPath(state, ['components', 'search']);


export {
    getSubstate,
}