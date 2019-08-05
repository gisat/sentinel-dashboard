import common from './_common';

export function getCurrentTime (state)  {return common.getByPath(state, ['currentTime'])};
export function getSelectTime (state)  {return common.getByPath(state, ['selectTime'])};
export function getFollowNow (state)  {return common.getByPath(state, ['followNow'])};
export function getLandscape (state)  {return common.getByPath(state, ['landscape'])};
export function getActiveLayers (state)  {return common.getByPath(state, ['activeLayers'])};

export default {
    getCurrentTime,
    getFollowNow,
    getSelectTime,
}