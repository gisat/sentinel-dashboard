import types from '../../types';

export const setView = (mapView) => {
    return {
        type: types.MAP.SET_VIEW,
        payload: {
            view: mapView,
        }
    }
}