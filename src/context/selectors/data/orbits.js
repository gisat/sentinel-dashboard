import common from '../_common';
import createCachedSelector from 're-reselect';

const getSubstate = (state) => common.getByPath(state, ['data', 'orbits']);
const getByKey = (state, key) => getSubstate(state).find(o => o.key === key);

export {
    getSubstate,
    getByKey,
}