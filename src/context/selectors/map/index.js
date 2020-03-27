import common from '../_common';

const getSubstate = (state) => common.getByPath(state, ['map']);
const getVisibleAcquisitionsPlans = (state) => getSubstate(state)['acquisitionPlans'];
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