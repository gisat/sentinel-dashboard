import common from '../_common';

const getSubstate = (state) => common.getByPath(state, ['data', 'satellites']);
const getSatelliteByKey = (state, satKey) => getSubstate(state).find(s => s.id === satKey);

export {
    getSubstate,
    getSatelliteByKey,
}