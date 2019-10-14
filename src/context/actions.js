import types from './types';
import moment from 'moment';
import select from './selectors/';
import {getInside} from '../utils/period';
import {getNowUTC} from '../utils/date';
import {getTle} from '../utils/tle';
import {getAllAcquisitionPlans} from '../utils/acquisitionPlans';
import WorldWind from 'webworldwind-gisat';
import WordWindX from 'webworldwind-x';
const {
    EoUtils
} = WordWindX;

const {
    Position
} = WorldWind;


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

    const orbitInfo = state.data.orbits
        .filter(orbit => {return orbit.key === 'orbit-' + satelliteId})[0];

    state.wwd.worldWindowController._isFixed = !satteliteIsFocused;
    state.wwd.navigator.camera._isFixed = !satteliteIsFocused;
    if(state.wwd && orbitInfo && !satteliteIsFocused) {
        const satrec = EoUtils.computeSatrec(orbitInfo.specs[0], orbitInfo.specs[1]);
        const position = EoUtils.getOrbitPosition(satrec, new Date(state.selectTime));
        // The range needs to be changed gradually to tha altitude of the satellite.
        // This one needs to properly clean to the satellite.

        state.wwd.navigator.range = 2 * position.altitude;
        state.wwd.navigator.lookAtLocation.latitude = position.latitude;
        state.wwd.navigator.lookAtLocation.longitude = position.longitude;
        state.wwd.navigator.lookAtLocation.altitude = position.altitude;
        state.wwd.redraw();
    }

    if (satteliteIsFocused) {
        const currentPosition = state.wwd.navigator.lookAtLocation;
        // Simply clean heading, roll and tilt to 0 gradually. The range should change to twice the current.
        // No position change necessary.
        state.wwd.navigator.range = 2 * currentPosition.altitude;
        state.wwd.navigator.lookAtLocation.latitude = currentPosition.latitude;
        state.wwd.navigator.lookAtLocation.longitude = currentPosition.longitude;
        state.wwd.navigator.lookAtLocation.altitude = currentPosition.altitude;
        state.wwd.navigator.heading = 0;
        state.wwd.navigator.tilt = 0;
        state.wwd.navigator.roll = 0;
        state.wwd.redraw();

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

export const setWwd = (wwd) => {
    return {
        type: types.SET_WWD,
        payload: wwd
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

export const scrollToTime = (state, dispatch, selectTime, newTime, period, callback) => {
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
            const newSelectedTime = moment(selectTime).add(peace * index).toDate().toString();
            const selectedTime = moment(selectTime).add(peace * (index - 1)).toDate().toString();
            // If the focus is there, move the navigator with the satellite.

            dispatch(changeSelectTime(newSelectedTime, dispatch, selectedTime, state));
        }
    }, 60)
};

/**
 * 
 * @param {string} time 
 */
export const changeSelectTime = (time, dispatch, selectTime, state) => {
    const selectTimeMoment = moment(selectTime);
    const selectYearDay = `${selectTimeMoment.year()}-${selectTimeMoment.dayOfYear()}`
    const momentTime = moment(time);
    const timeYearDay = `${momentTime.year()}-${momentTime.dayOfYear()}`
    const newTimeIsSameDay = selectYearDay === timeYearDay;

    const focusedSattelite = select.rootSelectors.getFocusedSattelite(state);

    if(focusedSattelite && state.wwd.worldWindowController._isFixed) {
        const orbitInfo = state.data.orbits
            .filter(orbit => {return orbit.key === 'orbit-' + focusedSattelite})[0];
        const satrec = EoUtils.computeSatrec(orbitInfo.specs[0], orbitInfo.specs[1]);
        const position = EoUtils.getOrbitPosition(satrec, new Date(time));
        // The range needs to be changed gradually to tha altitude of the satellite.
        // This one needs to properly clean to the satellite.

        state.wwd.navigator.range = 2 * position.altitude;
        state.wwd.navigator.lookAtLocation.latitude = position.latitude;
        state.wwd.navigator.lookAtLocation.longitude = position.longitude;
        state.wwd.navigator.lookAtLocation.altitude = position.altitude;
        state.wwd.redraw();
    }

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

/**
 * @param {Array.<Object>} - orbits
 */
export const setOrbits = (orbits) => {
    return {
        type: types.SET_ORBITS,
        payload: {
            orbits
        }
    }
}

/**
 * 
 */
export const updateTleData = (dispatch, selectTime) => {
    const selectTimeMoment = moment(selectTime);
    getTle(selectTimeMoment.format('YYYY-MM-DD')).then((data) => {
        if(data && data.length > 0) {
            return dispatch(setOrbits(data));
        }
    });
}


/**
 * @param {Array.<Object>} - orbits
 */
export const setAcquisitionPlans = (aps) => {
    return {
        type: types.SET_ACQUISITION_PLANS,
        payload: {
            aps
        }
    }
}

/**
 * 
 */
export const updateApsData = async (dispatch) => {
    const aps = await getAllAcquisitionPlans()
    dispatch(setAcquisitionPlans(aps));
}

/**
 * 
 */
export const mapAddVisibleAcquisitionPlanKey = (acquisitionPlanKey) => {
    return {
        type: types.MAP_ADD_VISIBLE_ACQUISITION_PLAN,
        payload: {
            key: acquisitionPlanKey
        }
    }
}

/**
 * 
 */
export const mapRemoveVisibleAcquisitionPlanKey = (acquisitionPlanKey) => {
    return {
        type: types.MAP_REMOVE_VISIBLE_ACQUISITION_PLAN,
        payload: {
            key: acquisitionPlanKey
        }
    }
}

/**
 * 
 */
export const dataUpdateAcquisitionPlan = (layerKey, satName, url, update) => {
    return {
        type: types.DATA_UPDATE_ACQUISITIONPLANS,
        payload: {
            key: satName,
            url,
            update,
        }
    }
}

/**
 * 
 */
export const toggleAcquisitionPlan = (state, acquisitionPlanKey) => {
    const acquisitionPlanVisible = select.map.isVisibleAcquisitionPlanByKey(state, acquisitionPlanKey);
    const action = acquisitionPlanVisible ? types.MAP_REMOVE_VISIBLE_ACQUISITION_PLAN : types.MAP_ADD_VISIBLE_ACQUISITION_PLAN;
    return {
        type: action,
        payload: {
            key: acquisitionPlanKey
        }
    }
}
