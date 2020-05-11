import common from '../_common';
import { createSelector } from 'reselect'

const getSubstate = (state) => common.getByPath(state, ['map']);
const getVisibleAcquisitionsPlans = createSelector([getSubstate],(substate) => substate.acquisitionPlans);
const getVisibleStatistics = createSelector([getSubstate],(substate) => substate.statistics.map(s => s.key));
const getLoadingStatistics = createSelector([getSubstate],(substate) => substate.statistics.filter(s => s.loading));
const isVisibleAcquisitionPlanByKey = (state, key) => {
    const acquisitionsPlans = getVisibleAcquisitionsPlans(state);
    return acquisitionsPlans && acquisitionsPlans.includes(key);
};

const isVisibleStatisticsByKey = (state, key) => {
    const statistics = getVisibleStatistics(state);
    return statistics && statistics.includes(key);
};

const getView = (state) => {
    const view = getSubstate(state)['view'];
    if(view.hasOwnProperty('headingCorrection')) {
        return {
            ...view,
            heading: view.heading - view.headingCorrection
        }
    } else {
        return view;
    }
};

const getPureView = (state) => getSubstate(state)['view'];

export {
    getSubstate,
    getView,
    getPureView,
    getVisibleAcquisitionsPlans,
    getVisibleStatistics,
    getLoadingStatistics,
    isVisibleAcquisitionPlanByKey,
    isVisibleStatisticsByKey,
}