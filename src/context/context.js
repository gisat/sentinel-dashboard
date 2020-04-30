import React, {createContext} from 'react'
import reducer from './reducer';
import {getNowUTCString} from '../utils/date'
import moment from 'moment';
import period from '../utils/period';
import {getSatDataByKey, getDefaultSatOrbitBySatKey} from './satData';
import {cloneDeep} from 'lodash';

const now = moment(getNowUTCString());

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

export const initialState = {
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
            'OL_1_EFR___': {
                key: 'OL_1_EFR___',
                name: 'OL_1_EFR___',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'OL_1_ERR___': {
                key: 'OL_1_ERR___',
                name: 'OL_1_ERR___',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'OL_2_LFR___': {
                key: 'OL_2_LFR___',
                name: 'OL_2_LFR___',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'OL_2_LRR___': {
                key: 'OL_2_LRR___',
                name: 'OL_2_LRR___',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SR_1_SRA___': {
                key: 'SR_1_SRA___',
                name: 'SR_1_SRA___',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SR_1_SRA_A_': {
                key: 'SR_1_SRA_A_',
                name: 'SR_1_SRA_A_',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SR_1_SRA_BS': {
                key: 'SR_1_SRA_BS',
                name: 'SR_1_SRA_BS',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SR_2_LAN___': {
                key: 'SR_2_LAN___',
                name: 'SR_2_LAN___',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SL_1_RBT___': {
                key: 'SL_1_RBT___',
                name: 'SL_1_RBT___',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SL_2_LST___': {
                key: 'SL_2_LST___',
                name: 'SL_2_LST___',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SY_2_SYN___': {
                key: 'SY_2_SYN___',
                name: 'SY_2_SYN___',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SY_2_V10___': {
                key: 'SY_2_V10___',
                name: 'SY_2_V10___',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SY_2_VG1___': {
                key: 'SY_2_VG1___',
                name: 'SY_2_VG1___',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
            'SY_2_VGP___': {
                key: 'SY_2_VGP___',
                name: 'SY_2_VGP___',
                description: 'Level-1 Single Look Complex (SLC) products consist of focused SAR data geo-referenced using orbit and attitude data from the satellite and provided in zero-Doppler slant-range geometry. The products include a single look in each dimension using the full transmit signal bandwidth and consist of complex samples preserving the phase information.'
            },
        },
        satellites: [
            {id: 's1a', name: 'S1-A', model: 'S1', iconClass: 'sentinel-1', satData: getSatDataByKey('s1a'), layers:['SLC', 'GRD', 'OCN'], statisticsKey: 'sentinel-1a', acquisitionPlanTimeWindow: 1200000, productsTimeWindow: 300000},
            {id: 's1b', name: 'S1-B', model: 'S1', iconClass: 'sentinel-1', satData: getSatDataByKey('s1b'), layers:['SLC', 'GRD', 'OCN'], acquisitionPlanTimeWindow: 1200000, productsTimeWindow: 300000},
            {id: 's2a', name: 'S2-A', model: 'S2', iconClass: 'sentinel-2', satData: getSatDataByKey('s2a'), layers:['S2MSI1C','S2MSI2A','S2MSI2Ap'],statisticsKey: 'sentinel-2a', acquisitionPlanTimeWindow: 1200000, productsTimeWindow: 300000},
            {id: 's2b', name: 'S2-B', model: 'S2', iconClass: 'sentinel-2', satData: getSatDataByKey('s2b'), layers:['S2MSI1C','S2MSI2A','S2MSI2Ap'], acquisitionPlanTimeWindow: 1200000, productsTimeWindow: 300000},
            {id: 's3a', name: 'S3-A', model: 'S3', iconClass: 'sentinel-3', satData: getSatDataByKey('s3a'), layers:['OL_1_EFR___','OL_1_ERR___','OL_2_LFR___','OL_2_LRR___','SR_1_SRA___','SR_1_SRA_A_','SR_1_SRA_BS','SR_2_LAN___','SL_1_RBT___','SL_2_LST___','SY_2_SYN___','SY_2_V10___','SY_2_VG1___','SY_2_VGP___'], acquisitionPlanTimeWindow: 1200000, productsTimeWindow: 300000},
            {id: 's3b', name: 'S3-B', model: 'S3', iconClass: 'sentinel-3', satData: getSatDataByKey('s3b'), layers:['OL_1_EFR___','OL_1_ERR___','OL_2_LFR___','OL_2_LRR___','SR_1_SRA___','SR_1_SRA_A_','SR_1_SRA_BS','SR_2_LAN___','SL_1_RBT___','SL_2_LST___','SY_2_SYN___','SY_2_V10___','SY_2_VG1___','SY_2_VGP___'], acquisitionPlanTimeWindow: 1200000, productsTimeWindow: 300000},
            {id: 's5p', name: 'S-5', model: 'S5', iconClass: 'sentinel-5', satData: getSatDataByKey('s5p'), layers:[], acquisitionPlanTimeWindow: 1200000, productsTimeWindow: 300000}
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
        acquisitionPlans: [],
        statistics: [],
        view: {},
    },
    periodLimit: stringPeriodLimit,
    activeLayers: [],
    focus: null, // Fix camera on sattelite
    selectTime: null,
    currentTime: getNowUTCString(),
    landscape: true,
    infoModal: {},
    followNow: true,
    trackTime: false,
    preventReloadLayers: false,
    selectTimePastOrCurrent: false,
    components:{
        satelliteSelect: {
            open: true,
            visible: true,
        },
        timeWidget: {
            visible: true,
        },
        timeline: {
            visible: true,
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
        search: {
            satellites: ['s1a', 's1b', 's2a', 's2b', 's3a', 's3b', '5p'],
            geometry: null,
            type: null, //types by active satellite? SLC/GRD/OCN
            activeResultIndex: null,
            results: []    
        },
        searchToolbar: {
            visible: false,
            loading: false,
            geometry: null, //{latitude:coordinates.latitude,longitude:coordinates.longitude,altitude:coordinates.altitude}
            orderedResults: [],
            activeOrderedResultIndex: null,

        }
    }
};

export const ContextProvider = (props) => {
    const [state, dispatch] =  React.useReducer(reducer, cloneDeep(initialState));
    const value = {state, dispatch};

    return <Context.Provider value={value}>{props.children}</Context.Provider>;
}