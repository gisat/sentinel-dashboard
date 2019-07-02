import React, {createContext} from 'react'
import reducer from './reducer';

export const Context = createContext({
    satellites: [],
    selected: null,
    focus: null,
    currentTime: null
});

const initialState = {
    satellites: [
        {id: 'S-1A', name: 'S1-A', iconClass: 's1-btn'},
        {id: 'S-1B', name: 'S1-B', iconClass: 's1-btn'},
        {id: 'S-2A', name: 'S2-A', iconClass: 's2-btn'},
        {id: 'S-2B', name: 'S2-B', iconClass: 's2-btn'},
        {id: 'S-3A', name: 'S3-A', iconClass: 's3-btn'},
        {id: 'S-3B', name: 'S3-B', iconClass: 's3-btn'},
        {id: 'S-5P', name: 'S-5', iconClass: 's5-btn'}
    ], // All the available satellites.
    selected: [], // Selected represents satellites for which we download data
    focus: null, // Focus represents the type of focus {type: 'satellite', value: 'S-2A'} or
        // {type: 'product', value: 'S-2A'} No focus mean the default selection.
    currentTime: new Date(),
    activeTimeLevel: 'years'
};

export const ContextProvider = (props) => {
    const [state, dispatch] =  React.useReducer(reducer, initialState);
    const value = {state, dispatch};

    return <Context.Provider value={value}>{props.children}</Context.Provider>;
}