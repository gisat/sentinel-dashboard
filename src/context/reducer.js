import types from './types';
import select from './selectors/';


export const addItemToIndex = (array, index, item) => [...array.slice(0, index), item, ...array.slice(index)];
export const removeItemByIndex = (array, index) => [...array.slice(0, index), ...array.slice(index + 1)];


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

const selectSatelite = (state, action) => {
    return {
        ...state,
        selected: [...state.selected, action.payload]
    };
}

const unselectSatelite = (state, action) => {
    return {
        ...state,
        selected: action.payload
    };
}

const setFocus = (state, action) => {
    return {
        ...state,
        focus: action.payload
    };
}

const setSelectTime = (state, action) => {
    return {
        ...state,
        selectTime: action.payload
    };
}

const setCurrentTime = (state, action) => {

    //if follow now
    let selectTimeState = {};

    //not clear solution, because I don't know, how to acces to current state in timer in action
    if(select.rootSelectors.getFollowNow(state)) {
        selectTimeState = setSelectTime(state, {
            payload: action.payload
        })
    }
    

    return {
        ...state,
        ...selectTimeState,
        currentTime: action.payload
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

export default (state, action) => {
    switch(action.type) {
        // Adds satellite to the selected.
        case types.SELECT_SATELLITE:
            return selectSatelite(state, action)
        // Replaces selected with the new selected provided in the payload.
        case types.UNSELECT_SATELLITE:
            return unselectSatelite(state, action)            
        // Focuses either on specific product or on specific satellite.
        case types.TOGGLE_LAYER:
            return toggleLayer(state, action);
        case types.ACTIVATE_LAYER:
            return activateLayer(state, action);
        case types.DEACTIVATE_LAYER:
            return deactivateLayer(state, action);
        // Removes focus from specific satellite.
        case types.UNFOCUS:
            return setFocus(state, null);
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
        default:
            return state;
    }
}