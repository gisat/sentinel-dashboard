import types from './types';
import moment from 'moment';
import select from './selectors/';
import {setViewFromNavigator, setView} from './actions/map';
import {getInside} from '../utils/period';
import {getNowUTCString} from '../utils/date';
import {getTle} from '../utils/tle';
import {getAllAcquisitionPlans} from '../utils/acquisitionPlans';
import satellitesUtils from '../utils/satellites';
import WorldWind from 'webworldwind-esa';
import WordWindX from 'webworldwind-x';

const {
    EoUtils
} = WordWindX;

const DEFAULT_NAVIGATOR = {
    lookAtLocation: {
        latitude: 0,
        longitude: 0,
        altitude: 0,
    },
    range: 0,
    heading: 0,
    tilt: 0,
    roll: 0,
}

let timer = null;
let nowTimer = null;
let intervalKeyZoom = null;
let intervalKeyScroll = null;

export const focusSatellite = (satelliteId) => {
    return {
        type: types.FOCUS_SATELLITE,
        payload: satelliteId
    }
}

// export const resetNavigatorFromPrevState = (state) => {

//     const savedNavigator = {};
//     // const currentPosition = state.wwd.navigator.lookAtLocation;
//     const navigator = {
//         lookAtLocation: {
//             latitude: savedNavigator.latitude,
//             longitude: savedNavigator.longitude,
//             altitude: savedNavigator.altitude
//         },
//         // The range needs to be changed gradually to tha altitude of the satellite.
//         // This one needs to properly clean to the satellite.
//         range: 2 * savedNavigator.altitude,
//         heading: 0,
//         tilt: 0,
//         roll: 0,
//     }

//     return setNavigator(navigator)

// }
export const setNavigatorFromOrbit = (selectTime, orbitInfo) => {
    const satrec = EoUtils.computeSatrec(orbitInfo.specs[0], orbitInfo.specs[1]);
    const position = EoUtils.getOrbitPosition(satrec, new Date(selectTime));
    const navigator = {
        lookAtLocation: {
            latitude: position.latitude,
            longitude: position.longitude,
            altitude: position.altitude
        },
        // The range needs to be changed gradually to tha altitude of the satellite.
        // This one needs to properly clean to the satellite.
        range: 2 * position.altitude,
    }
    
    return setNavigator(navigator)

}
export const updateNavigator = (prevNavigator, navigator) => {
    const updatedNavigator = {...DEFAULT_NAVIGATOR, ...prevNavigator, ...navigator};
    return setNavigator(updatedNavigator);
}
export const setNavigator = (navigator) => {
    return setViewFromNavigator(navigator);
}

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
        timeInPeriod = moment(getInside(period, moment(newTime)));
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
            const newSelectedTime = moment(selectTime).add(peace * index).toDate().toUTCString();
            const selectedTime = moment(selectTime).add(peace * (index - 1)).toDate().toUTCString();
            // If the focus is there, move the navigator with the satellite.

            dispatch(changeSelectTime(newSelectedTime, dispatch, selectedTime, state));
        }
    }, 60)
};

/**
 * 
 * @param {string} time New time
 * @param {function} dispatch
 * @param {string} selectTime */
export const changeSelectTime = (time, dispatch, selectTime, state) => {
    const selectTimeMoment = moment(selectTime);
    const selectYearDay = `${selectTimeMoment.year()}-${selectTimeMoment.dayOfYear()}`
    const momentTime = moment(time);
    const timeYearDay = `${momentTime.year()}-${momentTime.dayOfYear()}`
    const newTimeIsSameDay = selectYearDay === timeYearDay;

    //Check if new time is in another day. If so, reload orbits
    // future TLE are not available at the moment
    if(!newTimeIsSameDay) {
        updateTleData(dispatch, time);
    }

    const focusedSatellite = select.rootSelectors.getFocusedSatellite(state);
    const viewFixed = !!focusedSatellite;
    if(focusedSatellite) {
        const satellite = select.data.satellites.getSatelliteByKey(state, focusedSatellite);
        const isReleased = satellitesUtils.isSatelliteReleaseBeforeDate(satellite, selectTime)
        if(isReleased && viewFixed) {
            const orbitInfo = select.data.orbits.getByKey(state, `orbit-${focusedSatellite}`);
            // The range needs to be changed gradually to tha altitude of the satellite.
            // This one needs to properly clean to the satellite.
            // state.wwd.navigator.range = 2 * position.altitude;
            //TODO - hold camera position when crossing poles
            dispatch(setNavigatorFromOrbit(new Date(time), orbitInfo));
        } else if(!isReleased && viewFixed){
            //release focused satellite if selected date is before satellite release
            dispatch(focusSatellite(null))
            //TODO - dont set prev navigator, but respect current
            const prevNavigator = select.components.navigatorBackup.getSubstate(state);
            dispatch(setView(prevNavigator));
            dispatch(clearComponent('navigatorBackup'));

        }
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

/**
 * 
 * @param {bool} trackTime 
 */
export const setTrackTime = trackTime => {
    return {
        type: types.TRACK_TIME,
        payload: trackTime
      };
}

export const updateComponent = (component, data) => {
	return {
		type: types.COMPONENT.UPDATE,
		component: component,
		update: data
	}
}

export const setComponent = (component, path, value) => {
	return {
		type: types.COMPONENT.SET,
		component,
		path,
		value
	}
}
export const clearComponent = (component) => {
	return {
		type: types.COMPONENT.CLEAR,
		component,
	}
}

export const startTrackNowTime = (state, dispatch) => {
    window.clearInterval(nowTimer);
    nowTimer = window.setInterval(() => dispatch(nowTick()), 1000);
    dispatch(nowTick())
}

const nowTick = () => {
    const now = getNowUTCString();
    return changeCurrentTime(now.toString());
};

export const stopTimer = () => {
    return setTrackTime(false);
}

export const startTimer = (state, dispatch) => {
    return setTrackTime(true);
}

export const stopFollowNow = () => {
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
    const nowTimeMoment = moment();
    if(selectTimeMoment.isBefore(nowTimeMoment)) {
        getTle(selectTimeMoment.format('YYYY-MM-DD')).then((data) => {
            if(data && data.length > 0) {
                return dispatch(setOrbits(data));
            }
        });
    }
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

export const dataAcquisitionPlanSetVisibleCount = (satName, count) => {
    return {
        type: types.DATA_ACQUISITIONPLANS_SET_VISIBLE_COUNT,
        payload: {
            key: satName,
            count,
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

/**
 * 
 */
export const toggleStatistics = (state, satKey) => {
    const statisticsVisible = select.map.isVisibleStatisticsByKey(state, satKey);
    const action = statisticsVisible ? types.MAP.REMOVE_STATISTICS_LAYER : types.MAP.ADD_STATISTICS_LAYER;
    return {
        type: action,
        payload: {
            key: satKey
        }
    }
}


export const searchProducts = (satelliteId, layerId) => {
    
}
