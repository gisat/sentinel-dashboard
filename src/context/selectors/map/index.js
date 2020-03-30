import common from '../_common';
import { createSelector } from 'reselect'

const getSubstate = (state) => common.getByPath(state, ['map']);
const getVisibleAcquisitionsPlans = createSelector([getSubstate],(substate) => substate.acquisitionPlans);
const isVisibleAcquisitionPlanByKey = (state, key) => {
    const acquisitionsPlans = getVisibleAcquisitionsPlans(state);
    return acquisitionsPlans && acquisitionsPlans.includes(key);
};

const getView = (state) => getSubstate(state)['view'];

export {
    getSubstate,
    getView,
    getVisibleAcquisitionsPlans,
    isVisibleAcquisitionPlanByKey,
}