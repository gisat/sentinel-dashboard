import types from './types';
import moment from 'moment';
import select from './selectors/';
import {getInside} from '../utils/period';
import {getNowUTC} from '../utils/date';

let timer = null;
let nowTimer = null;
let intervalKeyZoom = null;
let intervalKeyScroll = null;
/**
 * 
 * @param {string} satelliteId 
 * @param {Object} state 
 */
export const toggleSatelliteFocus = (satelliteId, state) => {
    const focusedSattelite = select.rootSelectors.getFocusedSattelite(state);
    const satteliteIsFocused = focusedSattelite === satelliteId;

    if (satteliteIsFocused) {
        return {
            type: types.FOCUS_SATELLITE,
            payload: null
        };
    } else {
        return {
            type: types.FOCUS_SATELLITE,
            payload: satelliteId
        };
    }
};

/**
 * 
 * @param {string} satelliteKey 
 * @param {string} layerKey 
 */
export const toggleLayer = (satelliteKey, layerKey) => {
    return {
        type: types.TOGGLE_LAYER,
        payload: {
            type: 'product',
            satKey: satelliteKey,
            layerKey: layerKey,
        }
    }
};

/**
 * 
 * @param {string} modalKey 
 * @param {string} content 
 */
export const updateInfoModal = (modalKey, modalState) => {
    return {
        type: types.UPDATE_INFO_MODAL,
        payload: {
            modalKey,
            modalState,
        }
    }
};

/**
 * 
 * @param {string} modalKey 
 */
export const setActiveInfoModal = (modalKey) => {
    return {
        type: types.SET_ACTIVE_INFO_MODAL,
        payload: {
            modalKey,
        }
    }
};

/**
 * 
 * @param {string} satelliteKey 
 * @param {string} layerKey 
 */
export const setPreventReloadLayers = (preventReloadLayers) => {
    return {
        type: types.PREVENT_RELOAD_LAYERS,
        payload: preventReloadLayers
    }
};

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
            dispatch(updateComponent('timeline', {dayWidth: currentDayWidth + (peace * index)}))
        }
    }, 60)
};

export const scrollToTime = (dispatch, selectTime, newTime, period, callback) => {
    window.clearInterval(intervalKeyScroll);
    const steps = 12;
    let timeInPeriod = newTime;
    if(period) {
        timeInPeriod = getInside(period, moment(newTime));
    }
    const diff = timeInPeriod.diff(moment(selectTime));
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
            dispatch(changeSelectTime(moment(selectTime).add(peace * index).toDate().toString()));
        }
    }, 60)
};

/**
 * 
 * @param {string} time 
 */
export const changeSelectTime = time => {
    return {
        type: types.CHANGE_SELECTTIME,
        payload: time
    }
}

/**
 * 
 * @param {string} time 
 */
export const changeCurrentTime = time => {
    return {
        type: types.CHANGE_CURRENTTIME,
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

export const updateComponent = (component, data) => {
	return {
		type: types.COMPONENTS.UPDATE,
		component: component,
		update: data
	}
}

export const setComponent = (component, path, value) => {
	return {
		type: types.COMPONENTS.SET,
		component,
		path,
		value
	}
}

export const startTrackNowTime = (state, dispatch) => {
    window.clearInterval(nowTimer);
    nowTimer = window.setInterval(() => dispatch(nowTick(state)), 1000);
    dispatch(nowTick())
}

const nowTick = () => {
    const now = getNowUTC();
    return changeCurrentTime(now.toString());
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

/**
 * 
 * @param {string} layerKey 
 * @param {object} change 
 */
export const updateActiveLayer = (layerKey, change) => {
    return {
        type: types.UPDATE_ACTIVE_LAYER,
        payload: {
            layerKey,
            change
        }
    }
}
