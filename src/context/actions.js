import types from './types';
import moment from 'moment';
import {getInside} from '../utils/period';
import {getNowUTC} from '../utils/date';

export const addItemToIndex = (array, index, item) => [...array.slice(0, index), item, ...array.slice(index)];
export const removeItemByIndex = (array, index) => [...array.slice(0, index), ...array.slice(index + 1)];

let timer = null;
let nowOverlayTimer = null;
let intervalKeyZoom = null;
let intervalKeyScroll = null;
export const toggleSatelliteSelection = (satellite, state) => {
    const satelliteInSelected = state.selected.includes(satellite.id);
    let dispatchObj = {
        type: types.SELECT_SATELLITE,
        payload: satellite.id
    };
    if (satelliteInSelected) {
        const remainingSelected = state.selected.filter(selected => selected !== satellite.id);
        dispatchObj = {
            type: types.UNSELECT_SATELLITE,
            payload: remainingSelected
        };
    }
    return dispatchObj;
};

export const focusOnSatellite = satellite => {
    return {
        type: types.FOCUS,
        payload: {
            type: 'satellite',
            value: satellite.id
        }
    }
};

export const focusOnProduct = satellite => {
    return {
        type: types.FOCUS,
        payload: {
            type: 'product',
            value: satellite.id
        }
    }
};

export const setActiveTimeLevel = level => {
    return {
        type: types.CHANGE_ACTIVE_TIME_LEVEL,
        payload: level
    }
};

export const setTimeLevelDayWidth = dayWidth => {
    return {
        type: types.CHANGE_TIME_LINE_DAY_WIDTH,
        payload: dayWidth
    }
};

export const setTimeLineMouseTime = (mouseTime) => {
    return {
        type: types.TIME_LINE_SET_MOUSE_TIME,
        payload: mouseTime
    }
}
export const zoomToTimeLevel = (dispatch, level, levelDayWidth, currentDayWidth) => {
    window.clearInterval(intervalKeyZoom);
    //zoom to dayWidth
    const steps = 16;
    const finalDayWidth = levelDayWidth - 0.1;
    const dayWidthDiff =  finalDayWidth - currentDayWidth;
    const peace = dayWidthDiff / steps;
    let index = 0;

    intervalKeyZoom = window.setInterval(() => {
        index++;
        if(index > steps) {
            index = 0;
            window.clearInterval(intervalKeyZoom);
        } else {
            dispatch(setTimeLevelDayWidth(currentDayWidth + (peace * index)));
        }
    }, 60)
};

export const scrollToTime = (dispatch, currentTime, newTime, period, callback) => {
    window.clearInterval(intervalKeyScroll);
    const steps = 12;
    let timeInPeriod = newTime;
    if(period) {
        timeInPeriod = getInside(period, moment(newTime));
    }
    const diff = timeInPeriod.diff(moment(currentTime));
    const peace = diff / steps;
    let index = 0;
    intervalKeyScroll = window.setInterval(() => {
        index++;
        if(index > steps) {
            index = 0;
            window.clearInterval(intervalKeyScroll);
            if(typeof callback === 'function') {
                callback();
            }
        } else {
            dispatch(changeTime(moment(currentTime).add(peace * index).toDate()));
        }
    }, 60)
};

/**
 * 
 * @param {Date} time 
 */
export const changeTime = time => {
    return {
        type: types.CHANGE_TIME,
        payload: time
    }
}

/**
 * 
 * @param {bool} followNow 
 */
export const setFollowNow = followNow => {
    return {
        type: types.FOLLOW_NOW,
        payload: followNow
      };
}

export const setOverlays = overlays => {
    return {
        type: types.SET_OVERLAYS,
        payload: overlays
      };
}

export const startTimer = (dispatch) => {
    window.clearInterval(timer);
    timer = window.setInterval(() => dispatch(tick()), 1000);
    dispatch(setFollowNow(true));
    dispatch(tick())
}

export const startTrackNowOverlay = (state, dispatch) => {
    window.clearInterval(nowOverlayTimer);
    nowOverlayTimer = window.setInterval(() => dispatch(nowOverlayTick(state)), 1000);
    dispatch(nowOverlayTick(state));
}

const nowOverlayTick = (state) => {
    const nowOverlayKey = 'now';
    const overlays = state && state.timeLine && state.timeLine.overlays;
    if(!overlays) {
        return {}
    }
    const now = moment(getNowUTC());
    const overlayIndex = overlays.findIndex(o => o.key === nowOverlayKey);
    const nowOverlay = overlays[overlayIndex];
    const nowOverlayPlusSecond = {...nowOverlay, start: now.clone(), end: now.clone()};
    const withoutOverlay = removeItemByIndex(overlays, overlayIndex);
	const updatedOverlays = addItemToIndex(withoutOverlay, overlayIndex, nowOverlayPlusSecond);


    return setOverlays(updatedOverlays);
};

const tick = () => {
    return changeTime(getNowUTC());
};

export const stopTimer = () => {
  clearInterval(timer);
  return setFollowNow(false);
}

/**
 * 
 * @param {bool} landscape 
 */
export const setOrientation = (landscape) => {
    return {
        type: types.CHANGE_LANDSCAPE,
        payload: landscape
    }
}
