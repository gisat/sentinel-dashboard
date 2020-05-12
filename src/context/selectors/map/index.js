import common from '../_common';
import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect'

const getViewKey = (view) => {
    return `${view.center.lon}${view.center.lat}${view.center.altitude}${view.boxRange}${view.heading}${view.headingCorrection}${view.roll}${view.tilt}`
} 


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

const getView = createCachedSelector([state => state],(state) => {
    const view = getSubstate(state)['view'];
    const validHeadingCorrection = view.hasOwnProperty('headingCorrection') && (view.headingCorrection >= 0 || view.headingCorrection <= 0)
    const validHeading = view.hasOwnProperty('heading') && (view.heading >= 0 || view.heading <= 0)

    if(validHeadingCorrection && validHeading) {
        return {
            ...view,
            heading: view.heading - view.headingCorrection
        }
    } else {
        return view;
    }
})((state) => {
    const view = getSubstate(state)['view'];
    const viewKey = getViewKey(view);
    return viewKey;
    
})

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