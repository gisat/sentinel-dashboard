import React, {createContext} from 'react'
import reducer from './reducer';
import {getNowUTC} from '../utils/date'
import moment from 'moment';

const now = moment(getNowUTC());

export const Context = createContext({
    satellites: [],
    activeLayers: [],
    focus: null,
    selectTime: null,
    currentTime: null,
    followNow: null,
    preventReloadLayers: null,
    selectTimePastOrCurrent: null,
    components:{},
    infoModal: {},
});

const initialState = {
    data: {
        layers: {
            1: {
                key: 1,
                name: 'one'
            },
            2: {
                key: 2,
                name: 'two'
            },
            'SLC': {
                key: 'SLC',
                name: 's l c',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            }
        },
        satellites: [
            {id: 'S-1A', name: 'S1-A', iconClass: 'sentinel-1', layers:['SLC']},
            {id: 'S-1B', name: 'S1-B', iconClass: 'sentinel-1', layers:[1]},
            {id: 'S-2A', name: 'S2-A', iconClass: 'sentinel-2', layers:[1]},
            {id: 'S-2B', name: 'S2-B', iconClass: 'sentinel-2', layers:[1]},
            {id: 'S-3A', name: 'S3-A', iconClass: 'sentinel-3', layers:[1]},
            {id: 'S-3B', name: 'S3-B', iconClass: 'sentinel-3', layers:[1]},
            {id: 'S-5P', name: 'S-5', iconClass: 'sentinel-5', layers:[1]}
        ], // All the available satellites.
    },
    activeLayers: [],
    focus: 'S-1A', // Fix camera on sattelite
    selectTime: null,
    currentTime: getNowUTC(),
    landscape: true,
    infoModal: {},
    followNow: true,
    preventReloadLayers: false,
    selectTimePastOrCurrent: false,
    components:{
        satelliteSelect: {
            open: true,
        },
        timeline: {
            moving: false,
            mouseTime: null,
            dayWidth: null,
            activeTimeLevel: 'month',
            overlays: [
                {
                    key: 'now',
                    start: now.clone(),
                    end: now.clone(),
                    backdroundColor: 'rgba(77, 77, 239, 0.7)',
                    label: 'Mission',
                    classes: 'overlay1',
                    height: 70,
                    top: 0,
                },
            ]
        },
    }
};

export const ContextProvider = (props) => {
    const [state, dispatch] =  React.useReducer(reducer, initialState);
    const value = {state, dispatch};

    return <Context.Provider value={value}>{props.children}</Context.Provider>;
}