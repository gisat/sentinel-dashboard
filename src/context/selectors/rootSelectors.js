import { createSelector } from 'reselect'
import momentjs from 'moment';
import common from './_common';

export function getCurrentTime (state)  {return common.getByPath(state, ['currentTime'])};
export function getSelectTime (state)  {return common.getByPath(state, ['selectTime'])};
export function getFollowNow (state)  {return common.getByPath(state, ['followNow'])};
export function getLandscape (state)  {return common.getByPath(state, ['landscape'])};

//round time on minutes to prevent rerender on every second?
const getEndDataTime = getSelectTime;

//round time on minutes to prevent rerender on every second?
const getBeginDataTime = createSelector([state => state], (state) => momentjs(getSelectTime(state)).subtract(1, 'hour').toDate());

export const getActiveLayers = createSelector([
    state => common.getByPath(state, ['activeLayers']),
    getBeginDataTime,
    getEndDataTime,
], (activeLayers, beginTime, endTime) => {

    activeLayers.forEach(l => {
        l.beginTime = beginTime;
        l.endTime = endTime;
    });
    return activeLayers;
});

export default {
    getCurrentTime,
    getFollowNow,
    getSelectTime,
}