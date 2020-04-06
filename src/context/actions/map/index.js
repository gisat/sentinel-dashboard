import types from '../../types';

export const setView = (mapView) => {
    return {
        type: types.MAP.SET_VIEW,
        payload: {
            view: mapView,
        }
    }
}

export const updateStatistics = (satKey, change) => {
    return {
        type: types.MAP.UPDATE_STATISTICS,
        payload: {
            key: satKey,
            update: change,
        }
    }
}