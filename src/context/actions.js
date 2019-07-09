import types from './types';
import moment from 'moment';
import {getInside} from '../utils/period';

let timer = null;
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

export const startTimer = (dispatch) => {
  clearInterval(timer);
  timer = setInterval(() => dispatch(tick()), 1000);
  dispatch(setFollowNow(true));
  dispatch(tick())
}

const tick = () => {
    return changeTime(new Date());
};

export const stopTimer = () => {
  clearInterval(timer);
  return setFollowNow(false);
}
