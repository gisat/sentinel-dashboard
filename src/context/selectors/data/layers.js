import common from '../_common';
import createCachedSelector from 're-reselect';

const getSubstate = (state) => common.getByPath(state, ['data', 'layers']);
const getByKey = createCachedSelector([
    state => state,
    (state, key) => key
], (state, key) => common.getByKey(state, key))((state, key) => key);

export {
    getSubstate,
    getByKey,
}