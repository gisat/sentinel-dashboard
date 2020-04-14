import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect';
import moment from 'moment';


import common from '../_common';
import {getCurrentTime} from '../rootSelectors';
import {convertToUTC} from '../../../utils/date';

export const addItemToIndex = (array, index, item) => [...array.slice(0, index), item, ...array.slice(index)];
export const removeItemByIndex = (array, index) => [...array.slice(0, index), ...array.slice(index + 1)];

const getSubstate = (state) => common.getByPath(state, ['components', 'timeline']);

const getVisible = createSelector(getSubstate, substate => substate.visible);

const getActiveTimeLevel = createCachedSelector(getSubstate, substate => substate.activeTimeLevel)((state) => getSubstate(state).activeTimeLevel);

const getOverlays = createCachedSelector([getSubstate, getCurrentTime], (substate, currentTime) => {
    const nowOverlayKey = 'now';

    const overlays = substate.overlays;
    const time = currentTime ? convertToUTC(currentTime) : null;
    const now = moment(time);
    const overlayIndex = overlays.findIndex(o => o.key === nowOverlayKey);
    const nowOverlay = overlays[overlayIndex];
    const nowOverlayPlusSecond = {...nowOverlay, start: now.clone(), end: now.clone()};
    const withoutOverlay = removeItemByIndex(overlays, overlayIndex);
	const updatedOverlays = addItemToIndex(withoutOverlay, overlayIndex, nowOverlayPlusSecond);
    return updatedOverlays;
})((state) => {
    const nowOverlayKey = 'now';

    const overlays = common.getByPath(state, ['components', 'timeline', 'overlays']);
    const now = moment(getCurrentTime(state));

    const overlayIndex = overlays.findIndex(o => o.key === nowOverlayKey);
    const nowOverlay = overlays[overlayIndex];
    const nowOverlayPlusSecond = {...nowOverlay, start: now.clone(), end: now.clone()};
    const withoutOverlay = removeItemByIndex(overlays, overlayIndex);
	const updatedOverlays = addItemToIndex(withoutOverlay, overlayIndex, nowOverlayPlusSecond);
    return updatedOverlays.map(o => `${o.key}-${o.start.toString()}-${o.end.toString()}-${o.backdroundColor}-${o.label}`).join(',');
});

export {
    getSubstate,
    getActiveTimeLevel,
    getOverlays,
    getVisible,
}