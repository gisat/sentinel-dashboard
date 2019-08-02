import { createSelector } from 'reselect'
import {get} from 'lodash';

const getSubstate = (state, substate) => state[substate];

const getByPath = createSelector([
        state => state,
        (state, path) => path,
    ], (state, path) => get(state, path, null));

export default{
    getSubstate,
    getByPath,
}