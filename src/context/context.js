import React, {createContext} from 'react'
import reducer from './reducer';
import {getNowUTC} from '../utils/date'
import moment from 'moment';
import period from '../utils/period';
import {getSatDataByKey, getDefaultSatOrbitBySatKey} from './satData';

const now = moment(getNowUTC());

const periodLimit = period('2010/2025');
const stringPeriodLimit = {
    start: periodLimit.start.toDate().toString(),
    end: periodLimit.end.toDate().toString(),
}

export const Context = createContext({
    periodLimit: null,
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
            //sentinel 1
            'SLC': {
                key: 'SLC',
                name: 'SLC',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'GRD': {
                key: 'GRD',
                name: 'GRD',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'OCN': {
                key: 'OCN',
                name: 'OCN',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            //sentinel 2
            'S2MSI1C': {
                key: 'S2MSI1C',
                name: 'S2MSI1C',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'S2MSI2A': {
                key: 'S2MSI2A',
                name: 'S2MSI2A',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'S2MSI2Ap': {
                key: 'S2MSI2Ap',
                name: 'S2MSI2Ap',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            //sentinel 3
            'OL_1_EFR': {
                key: 'OL_1_EFR',
                name: 'OL_1_EFR',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'OL_1_ERR': {
                key: 'OL_1_ERR',
                name: 'OL_1_ERR',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'OL_2_LFR': {
                key: 'OL_2_LFR',
                name: 'OL_2_LFR',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'OL_2_LRR': {
                key: 'OL_2_LRR',
                name: 'OL_2_LRR',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SR_1_SRA': {
                key: 'SR_1_SRA',
                name: 'SR_1_SRA',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SR_1_SRA_A': {
                key: 'SR_1_SRA_A',
                name: 'SR_1_SRA_A',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SR_1_SRA_BS': {
                key: 'SR_1_SRA_BS',
                name: 'SR_1_SRA_BS',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SR_2_LAN': {
                key: 'SR_2_LAN',
                name: 'SR_2_LAN',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SR_1_RBT': {
                key: 'SR_1_RBT',
                name: 'SR_1_RBT',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SL_2_LST': {
                key: 'SL_2_LST',
                name: 'SL_2_LST',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SY_2_SYN': {
                key: 'SY_2_SYN',
                name: 'SY_2_SYN',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SY_2_V10': {
                key: 'SY_2_V10',
                name: 'SY_2_V10',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SY_2_VG1': {
                key: 'SY_2_VG1',
                name: 'SY_2_VG1',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SY_2_VGP': {
                key: 'SY_2_VGP',
                name: 'SY_2_VGP',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
        },
        satellites: [
            {id: 's1a', name: 'S1-A', model: 'S1', iconClass: 'sentinel-1', satData: getSatDataByKey('s1a'), layers:['SLC', 'GRD', 'OCN']},
            {id: 's1b', name: 'S1-B', model: 'S1', iconClass: 'sentinel-1', satData: getSatDataByKey('s1b'), layers:['SLC', 'GRD', 'OCN']},
            {id: 's2a', name: 'S2-A', model: 'S2', iconClass: 'sentinel-2', satData: getSatDataByKey('s2a'), layers:['S2MSI1C','S2MSI2A','S2MSI2Ap']},
            {id: 's2b', name: 'S2-B', model: 'S2', iconClass: 'sentinel-2', satData: getSatDataByKey('s2b'), layers:['S2MSI1C','S2MSI2A','S2MSI2Ap']},
            {id: 's3a', name: 'S3-A', model: 'S3', iconClass: 'sentinel-3', satData: getSatDataByKey('s3a'), layers:['OL_1_EFR','OL_1_ERR','OL_2_LFR','OL_2_LRR','SR_1_SRA','SR_1_SRA_A','SR_1_SRA_BS','SR_2_LAN','SR_1_RBT','SL_2_LST','SY_2_SYN','SY_2_V10','SY_2_VG1','SY_2_VGP']},
            {id: 's3b', name: 'S3-B', model: 'S3', iconClass: 'sentinel-3', satData: getSatDataByKey('s3b'), layers:['OL_1_EFR','OL_1_ERR','OL_2_LFR','OL_2_LRR','SR_1_SRA','SR_1_SRA_A','SR_1_SRA_BS','SR_2_LAN','SR_1_RBT','SL_2_LST','SY_2_SYN','SY_2_V10','SY_2_VG1','SY_2_VGP']},
            {id: 's5p', name: 'S-5', model: 'S5', iconClass: 'sentinel-5', satData: getSatDataByKey('s5p'), layers:[]}
        ], // All the available satellites.
        orbits: [
            getDefaultSatOrbitBySatKey('s1a'),
            getDefaultSatOrbitBySatKey('s1b'),
            getDefaultSatOrbitBySatKey('s2a'),
            getDefaultSatOrbitBySatKey('s2b'),
            getDefaultSatOrbitBySatKey('s3a'),
            getDefaultSatOrbitBySatKey('s3b'),
            getDefaultSatOrbitBySatKey('s5p'),
        ],
        acquisitionPlans: [],
    },
    map: {
        acquisitionPlans: []
    },
    periodLimit: stringPeriodLimit,
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