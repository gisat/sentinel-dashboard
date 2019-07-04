import types from './types';

let timer = null;

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

export const startTimer = (dispatch) => {
  clearInterval(timer);
  timer = setInterval(() => dispatch(tick()), 1000);
  dispatch({
      type: types.FOLLOW_NOW,
      payload: true
    });
  dispatch(tick())
}

const tick = () => {
    return changeTime(new Date());
};

export const stopTimer = () => {
  clearInterval(timer);
  return {
    type: types.FOLLOW_NOW,
    payload: false
  };
}
