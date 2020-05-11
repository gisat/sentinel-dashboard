import types from '../../types';


export const setViewFromNavigator = (navigator) => {
    const mapView = {
        center: {
            lat: navigator.lookAtLocation.latitude,
            lon: navigator.lookAtLocation.longitude,
            altitude: navigator.lookAtLocation.altitude
        },
        range: navigator.range,
        heading: navigator.heading,
        tilt: navigator.tilt,
        roll: navigator.roll,

    }

    return updateMapView(mapView);
}

export const updateMapView = (mapView) => {
    return {
        type: types.MAP.UPDATE_VIEW,
        payload: {
            view: mapView,
        }
    }
}
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