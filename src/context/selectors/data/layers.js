import common from '../_common';

const getSubstate = (state) => common.getByPath(state, ['data', 'layers']);
const getByKey = common.getByKey;

export {
    getSubstate,
    getByKey,
}