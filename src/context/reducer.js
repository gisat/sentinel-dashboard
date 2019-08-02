import types from './types';

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

const setTime = (state, action) => {
    return {
        ...state,
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
        case types.FOCUS:
            return setFocus(state, action);
        // Removes focus from specific satellite.
        case types.UNFOCUS:
            return setFocus(state, null);
        case types.CHANGE_TIME:
            return setTime(state, action);
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