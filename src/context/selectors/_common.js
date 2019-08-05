import { createSelector } from 'reselect'
import {get} from 'lodash';

const getSubstate = createSelector([
        state => state,
        (state, substate) => substate,
    ], (state, substate) => state[substate]
)

const getByPath = createSelector([
        state => state,
        (state, path) => path,
    ], (state, path) => get(state, path, null));

const getByKey = createSelector([
        state => state,
        (state, key) => key,
    ], (state, key) => state[key]
)

export default{
    getSubstate,
    getByPath,
    getByKey,
}