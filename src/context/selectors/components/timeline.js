import { createSelector } from 'reselect'
import moment from 'moment';


import common from '../_common';
import {getCurrentTime} from '../rootSelectors';

export const addItemToIndex = (array, index, item) => [...array.slice(0, index), item, ...array.slice(index)];
export const removeItemByIndex = (array, index) => [...array.slice(0, index), ...array.slice(index + 1)];

const getSubstate = (state) => common.getByPath(state, ['components', 'timeline']);

const getVisible = createSelector(getSubstate, substate => substate.visible);

const getOverlays = (state) => {
    const nowOverlayKey = 'now';

    const overlays = common.getByPath(state, ['components', 'timeline', 'overlays']);
    const now = moment(getCurrentTime(state));

    const overlayIndex = overlays.findIndex(o => o.key === nowOverlayKey);
    const nowOverlay = overlays[overlayIndex];
    const nowOverlayPlusSecond = {...nowOverlay, start: now.clone(), end: now.clone()};
    const withoutOverlay = removeItemByIndex(overlays, overlayIndex);
	const updatedOverlays = addItemToIndex(withoutOverlay, overlayIndex, nowOverlayPlusSecond);
    return updatedOverlays;
};

export {
    getSubstate,
    getOverlays,
    getVisible,
}