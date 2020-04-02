import common from '../_common';
import { createSelector } from 'reselect'

const getSubstate = (state) => common.getByPath(state, ['map']);
const getVisibleAcquisitionsPlans = createSelector([getSubstate],(substate) => substate.acquisitionPlans);
const getVisibleStatistics = createSelector([getSubstate],(substate) => substate.statistics);
const isVisibleAcquisitionPlanByKey = (state, key) => {
    const acquisitionsPlans = getVisibleAcquisitionsPlans(state);
    return acquisitionsPlans && acquisitionsPlans.includes(key);
};

const isVisibleStatisticsByKey = (state, key) => {
    const statistics = getVisibleStatistics(state);
    return statistics && statistics.includes(key);
};

const getView = (state) => getSubstate(state)['view'];

export {
    getSubstate,
    getView,
    getVisibleAcquisitionsPlans,
    getVisibleStatistics,
    isVisibleAcquisitionPlanByKey,
    isVisibleStatisticsByKey,
}