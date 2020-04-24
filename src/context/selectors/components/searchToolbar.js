import { createSelector } from 'reselect'
import moment from 'moment';
import common from '../_common';

const getSubstate = (state) => common.getByPath(state, ['components', 'searchToolbar']);
// const getActiveResultIndex = (state) => common.getByPath(state, ['components', 'searchToolbar', 'activeResultIndex']);
// const getResults = (state) => common.getByPath(state, ['components', 'searchToolbar', 'results']);
const getVisible = createSelector([getSubstate], (substate) => {
    return substate.visible;
})

export {
    getSubstate,
    getVisible,
}