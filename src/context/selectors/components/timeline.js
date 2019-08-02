import { createSelector } from 'reselect'

import common from '../_common';

const getSubstate = (state) => common.getByPath(state, ['components', 'timeline']);

export {
    getSubstate,
}