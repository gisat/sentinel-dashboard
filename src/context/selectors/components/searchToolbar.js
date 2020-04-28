import { createSelector } from 'reselect'
import moment from 'moment';
import common from '../_common';

const getSubstate = (state) => common.getByPath(state, ['components', 'searchToolbar']);
const getActiveResultIndex = (state) => common.getByPath(state, ['components', 'searchToolbar', 'activeOrderedResultIndex']);
const getOrderedResults = (state) => common.getByPath(state, ['components', 'searchToolbar', 'orderedResults']);
const getLoading = (state) => common.getByPath(state, ['components', 'searchToolbar', 'loading']);

const getLastResultIndex = createSelector([
        getOrderedResults,
    ],
    (orderedResults) => {
        return orderedResults.length;
    }
);

const getActiveResult = createSelector([
        getActiveResultIndex,
        getOrderedResults,
    ],
    (activeResultIndex, orderedResults) => {
        return orderedResults[activeResultIndex];
    }
);

const getResultByIndex = createSelector([
        getOrderedResults,
        (state, index) => index,
    ],
    (orderedResults, index) => {
        return orderedResults[index];
    }
);

const getGeometry = (state) => getSubstate(state).geometry;
const getVisible = createSelector([getSubstate], (substate) => {
    return substate.visible;
})

export {
    getActiveResultIndex,
    getSubstate,
    getLoading,
    getVisible,
    getGeometry,
    getResultByIndex,
    getActiveResult,
    getLastResultIndex
}