import { createSelector } from 'reselect'
import moment from 'moment';


import common from '../_common';

const getSubstate = (state) => common.getByPath(state, ['components', 'timeWidget']);

const getVisible = createSelector(getSubstate, substate => substate.visible);

export {
    getVisible,
}