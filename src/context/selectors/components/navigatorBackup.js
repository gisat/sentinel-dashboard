import common from '../_common';

const getSubstate = (state) => common.getByPath(state, ['components', 'navigatorBackup']);

export {
    getSubstate,
}