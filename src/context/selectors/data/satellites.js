import common from '../_common';

const getSubstate = (state) => common.getByPath(state, ['data', 'satellites']);

export {
    getSubstate,
}