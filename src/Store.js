import React from 'react'

export const Store = React.createContext();

const initialState = {
    satellites: [
        {id: 'S-1A', name: 'Sentinel 1A'},
        {id: 'S-1B', name: 'Sentinel-1B'},
        {id: 'S-2A', name: 'Sentinel-2A'},
        {id: 'S-2B', name: 'Sentinel-2B'},
        {id: 'S-3A', name: 'Sentinel-3A'},
        {id: 'S-3B', name: 'Sentinel-3B'},
        {id: 'S-5P', name: 'Sentinel-5P'}
    ], // All the available satellites.
    selected: [], // Selected represents satellites for which we download data
    focus: null, // Focus represents the type of focus {type: 'satellite', value: 'S-2A'} or
        // {type: 'product', value: 'S-2A'} No focus mean the default selection.
    currentTime: new Date()
};

function reducer(state, action) {
    switch(action.type) {
        // Adds satellite to the selected.
        case 'SELECT_SATELLITE':
            return {
                ...state,
                selected: [...state.selected, action.payload]};
        // Replaces selected with the new selected provided in the payload.
        case 'UNSELECT_SATELLITE':
            return {
                ...state,
                selected: action.payload
            };
        // Focuses either on specific product or on specific satellite.
        case 'FOCUS':
            return {
                ...state,
                focus: action.payload
            };
        // Removes focus from specific satellite.
        case 'UNFOCUS':
            return {
                ...state,
                focus: null
            };
        case 'CHANGE_TIME':
            return {
                ...state,
                currentTime: action.payload
            };
        default:
            return state;
    }
}

export function StoreProvider(props) {
    const [state, dispatch] =  React.useReducer(reducer, initialState);
    const value = {state, dispatch};

    return <Store.Provider value={value}>{props.children}</Store.Provider>;
}