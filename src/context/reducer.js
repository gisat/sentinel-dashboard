import moment from 'moment';
import types from './types';
import select from './selectors/';
import {removeItemByIndex,replaceItemOnIndex} from '../utils/arrayManipulation';

const deactivateLayer = (state, action) => {
    const satKey = action.payload.satKey;
    const layerKey = action.payload.layerKey;

    const activeLayers = select.rootSelectors.getActiveLayers(state);
    const activeIndex = activeLayers.findIndex(l => l.satKey === satKey && l.layerKey === layerKey);

    if(activeIndex > -1) {
        return {
            ...state,
            activeLayers: removeItemByIndex(activeLayers, activeIndex)
        };
    } else {
        return state
    }
}

const activateLayer = (state, action) => {
    const satKey = action.payload.satKey;
    const layerKey = action.payload.layerKey;

    const activeLayers = select.rootSelectors.getActiveLayers(state);
    const activeIndex = activeLayers.findIndex(l => l.satKey === satKey && l.layerKey === layerKey);

    if(activeIndex === -1) {
        return {
            ...state,
            activeLayers: [...activeLayers, {satKey, layerKey}]
        };
    } else {
        return state
    }
}

const toggleLayer = (state, action) => {
    const satKey = action.payload.satKey;
    const layerKey = action.payload.layerKey;

    const activeLayers = select.rootSelectors.getActiveLayers(state);
    const activeIndex = activeLayers.findIndex(l => l.satKey === satKey && l.layerKey === layerKey);

    if(activeIndex > -1) {
        return deactivateLayer(state, {
            payload: {
                satKey,
                layerKey
            }
        })
    } else {
        return activateLayer(state, {
            payload: {
                satKey,
                layerKey
            }
        })
    }
}

const setPreventReloadLayers = (state, action) => {
    return {
        ...state,
        preventReloadLayers: action.payload
    };
}

const focusSatelite = (state, action) => {
    return {
        ...state,
        focus: action.payload
    };
}

const setSelectTime = (state, action) => {
    //FIXME - should be dispatched separated to set selectTimePastCurrent
    const currentTime = select.rootSelectors.getCurrentTime(state);
    const selectTime = action.payload;
    
    return {
        ...state,
        selectTime: action.payload,
        selectTimePastCurrent: moment(selectTime).isAfter(currentTime),
    };
}

const setCurrentTime = (state, action) => {
    //FIXME - should be dispatched separated to set selectTimePastCurrent and setSelectTime
    const currentTime = action.payload;
    const selectTime = select.rootSelectors.getSelectTime(state);
    //if follow now
    let selectTimeState = {};

    //not clear solution, because I don't know, how to acces to current state in timer in action
    if(select.rootSelectors.getFollowNow(state)) {
        selectTimeState = setSelectTime(state, {
            payload: currentTime
        })
    }
    

    return {
        ...state,
        ...selectTimeState,
        currentTime: currentTime,
        selectTimePastCurrent: moment(selectTime).isAfter(currentTime),
    };
}

const setActiveTimeLevel = (state, action) => {
    return {
        ...state,
        activeTimeLevel: action.payload
    };
}

const setFollowNow = (state, action) => {
    return {
        ...state,
        followNow: action.payload
    };
}

const setTimeLineDayWidth = (state, action) => {
    return {
        ...state,
        timeLine: {...state.timeLine, dayWidth: action.payload}
    };
}

const setTimeLineMouseTime = (state, action) => {
    return {
        ...state,
        timeLine: {...state.timeLine, mouseTime: action.payload}
    };
}

const setLandscape = (state, action) => {
    return {
        ...state,
        landscape: action.payload
    };
}

const setOverlays = (state, action) => {
    return {
        ...state,
        timeLine: {...state.timeLine, overlays: action.payload}
    };
}

const setHelper = (state, path, value) => {
	let remainingPath = [...path];
	let currentKey = remainingPath.shift();
	if (remainingPath.length) {
		return {...state, [currentKey]: setHelper(state[currentKey], remainingPath, value)};
	} else {
		return {...state, [currentKey]: value};
	}
}

const updateComponent = (state, action) => {
	return {...state, components: {...state.components, [action.component]: state.components[action.component] ? {...state.components[action.component], ...action.update} : action.update}};
}

const setComponent = (state, action) => {
	let path = action.path.split('.');
	return {...state, components: {...state.components, [action.component]: setHelper(state.components[action.component], path, action.value)}};
}

const updateActiveLayer = (state, action) => {
    //get layer by key
    const layerKey = action.payload.layerKey.layerKey;
    const satKey = action.payload.layerKey.satKey;
    const change = action.payload.change;

    const activeLayers = select.rootSelectors.getActiveLayers(state);
    const layerIndex = activeLayers.findIndex(l => l.satKey === satKey && l.layerKey === layerKey);

    if(layerIndex > -1) {
        const layerInfo = state.activeLayers[layerIndex];
        delete layerInfo.message;
        delete layerInfo.status;
        delete layerInfo.loadedCount;
        delete layerInfo.totalCount;
        return {
            ...state,
            activeLayers: replaceItemOnIndex(activeLayers, layerIndex, {...layerInfo, ...change})
        };
    } else {
        return state
    }
}

export default (state, action) => {
    switch(action.type) {
        case types.FOCUS_SATELLITE:
            return focusSatelite(state, action)
        case types.TOGGLE_LAYER:
            return toggleLayer(state, action);
        case types.PREVENT_RELOAD_LAYERS:
            return setPreventReloadLayers(state, action);
        case types.ACTIVATE_LAYER:
            return activateLayer(state, action);
        case types.DEACTIVATE_LAYER:
            return deactivateLayer(state, action);
        case types.CHANGE_SELECTTIME:
            return setSelectTime(state, action);
        case types.CHANGE_CURRENTTIME:
            return setCurrentTime(state, action);
        case types.CHANGE_ACTIVE_TIME_LEVEL:
            return setActiveTimeLevel(state, action);
        case types.FOLLOW_NOW:
            return setFollowNow(state, action);
        case types.CHANGE_TIME_LINE_DAY_WIDTH:
            return setTimeLineDayWidth(state, action);
        case types.TIME_LINE_SET_MOUSE_TIME:
            return setTimeLineMouseTime(state, action);
        case types.CHANGE_LANDSCAPE:
            return setLandscape(state, action);
        case types.SET_OVERLAYS:
            return setOverlays(state, action);
        case types.COMPONENTS.UPDATE:
            return updateComponent(state, action);
        case types.COMPONENTS.SET:
            return setComponent(state, action);
        case types.UPDATE_ACTIVE_LAYER:
            return updateActiveLayer(state, action);
        default:
            return state;
    }
}