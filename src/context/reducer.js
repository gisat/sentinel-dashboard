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
        default:
            return state;
    }
}