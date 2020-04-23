import createCachedSelector from 're-reselect';
import momentjs from 'moment';
import common from './_common';
import {getSubstate as getOrbitsSubstate} from './data/orbits';
import {getSubstate as getSatellitesSubstate} from './data/satellites';
import {getSearchLayer} from './components/search';
import {getSubstate as getAcquisitionPlansSubstate, getPlansForDate} from './data/acquisitionPlans';
import {getVisibleAcquisitionsPlans, getVisibleStatistics} from './map';
import {getPlansKeys} from '../../utils/acquisitionPlans';
import {getSwathKeysFromAPS} from '../../utils/swath';
import satellitesUtils from '../../utils/satellites';
import {getSatDataByKey} from '../satData';
export const getSelectTimePastOrCurrent = (state) => common.getByPath(state, ['selectTimePastOrCurrent']);

export const getCurrentTime = createCachedSelector(
    (state) => common.getByPath(state, ['currentTime']),
    (currentTime) => currentTime
)((state) => common.getByPath(state, ['currentTime']))

export const getPreventReloadLayers = (state) => common.getByPath(state, ['preventReloadLayers']);
export const getActiveInfoModalKey = (state) => common.getByPath(state, ['infoModal', 'active']);
export const getInfoModal = (state, infoModalKey) => common.getByPath(state, ['infoModal', infoModalKey]);

export const getSelectTime = createCachedSelector(
    (state) => common.getByPath(state, ['selectTime']),
    (selectTime) => {
        return new Date(selectTime)
    }
)((state) => {
    const key = common.getByPath(state, ['selectTime'])
    return key;
})

//round time on minutes to prevent rerender on every second?
export const getBeginDataTime = createCachedSelector(
    getSelectTime,
    (selectTime) => {
        const beginDataTime = momentjs(selectTime).subtract(5, 'minutes').toDate().toString();
        return beginDataTime;
    }
)((state) => {
    const selectTime = getSelectTime(state);
    const cacheKey = momentjs(selectTime).subtract(5, 'minutes').toDate().toString();
    return cacheKey;

})

export const getPureActiveLayers = createCachedSelector(
    (state) => common.getByPath(state, ['activeLayers']),
    (activeLayers) => {
        return activeLayers
    }
)((state) => {
    const activeLayers = common.getByPath(state, ['activeLayers'])
    const cacheKey = activeLayers.map(l => `${l.layerKey}${l.satKey}`).join(',');
    return cacheKey;
})

export function getFollowNow (state)  {return common.getByPath(state, ['followNow'])};

export function getTrackTimeActive (state)  {return common.getByPath(state, ['trackTime'])};

export function getPeriodLimit (state)  {return common.getByPath(state, ['periodLimit'])};

export function getLandscape (state)  {return common.getByPath(state, ['landscape'])};

export function getFocusedSattelite (state)  {return common.getByPath(state, ['focus'])};

//round time on minutes to prevent rerender on every second?

const getBeginTime = (selectTime, productsTimeWindow) => {
    return momentjs(selectTime).subtract(productsTimeWindow, 'millisecond').toDate();
}


const getSatelliteForLayer = (satellitesSubstate, satKey) => {
    const salellite = satellitesSubstate.find(s => s.id === satKey);
    return salellite || null;
}

const getOrbitForLayer = (orbitsSubstate, orbitKey) => {
    const orbit = orbitsSubstate.find(o => o.key === orbitKey);
    return (orbit && orbit.specs) || null;
}

export const getActiveLayers = createCachedSelector(
    getPureActiveLayers,
    getSelectTimePastOrCurrent,
    getOrbitsSubstate,
    getSatellitesSubstate,
    getPlansForDate,
    getVisibleAcquisitionsPlans,
    getVisibleStatistics,
    (state, selectTime) => selectTime,
    getFocusedSattelite,
    getSearchLayer,
    (activeLayers, selectTimePastOrCurrent, orbitsSubstate, satellitesSubstate, acquisitionPlans, visibleAcquisitionsPlans, visibleStatistics, selectTime, focusedSatellite, searchLayer) => {
    const activeSentinelLayers = [];
    activeLayers.forEach(l => {
        const satData = getSatDataByKey(l.satKey);
        const layer = {...l,
            type: 'sentinelData',
            beginTime: getBeginTime(selectTime, getSatelliteForLayer(satellitesSubstate, l.satKey).productsTimeWindow),
            endTime: selectTime,
            disabled: selectTimePastOrCurrent || !satellitesUtils.isSatelliteReleaseBeforeDate({satData}, selectTime),
            satData,
        }
        activeSentinelLayers.push(layer);
    });

    //search layer
    const searchLayers = [];
    if(searchLayer) {
        searchLayers.push({
            type: 'sentinelFootprint',
            results: [searchLayer],
        });
    }

    const orbitLayers = orbitsSubstate.filter((o) =>
        satellitesUtils.filterByReleasedSatellite(o, satellitesSubstate, selectTime)
        ).filter((o) =>
            satellitesUtils.filterByActiveSatellite(o, focusedSatellite)
        ).map(o => ({...o, type: 'orbit'}));    

    const satellitesLayers = satellitesSubstate.filter((s) => satellitesUtils.isSatelliteReleaseBeforeDate(s, selectTime)).map(s => (
        {
            type: 'satellite',
            key: s.id,
            name: s.name,
            model: s.model,
            satData: s.satData,
            time: selectTime,
            tle: getOrbitForLayer(orbitsSubstate, `orbit-${s.id}`)
        }
    ));

    let acquisitionPlanLayers = [];
    
    //todo filter by visible APS data

    if(selectTimePastOrCurrent) {
        acquisitionPlanLayers = acquisitionPlans.filter(p => visibleAcquisitionsPlans.includes(p.key)).map(aps => (
            {
                type: 'acquisitionPlan',
                key:`acquisitionPlans_${aps.key}`,
                name: aps.key,
                plans: aps.plans,
                selectTime,
                satName: aps.key,
                tle: getOrbitForLayer(orbitsSubstate, `orbit-${aps.key}`),
                range: getSatelliteForLayer(satellitesSubstate, aps.key).acquisitionPlanTimeWindow
            }
        ));    
    };


    let swathLayers = [];
    //take settings from acquisitions plans in future
    if(selectTimePastOrCurrent) {
        for (const acqPlanLayerConfig of acquisitionPlanLayers) {
            swathLayers.push({
                type: 'swath',
                key:`swath_${acqPlanLayerConfig.key}`,
                apsKey:`${acqPlanLayerConfig.key}`,
                apsIDKey: getPlansKeys(acqPlanLayerConfig.plans),
                // name: aps.key,
                // plans: aps.plans,
                // selectTime,
                satName: acqPlanLayerConfig.satName,
                tle: getOrbitForLayer(orbitsSubstate, `orbit-${acqPlanLayerConfig.satName}`),
                // range: getSatelliteForLayer(satellitesSubstate, aps.key).acquisitionPlanTimeWindow
            })
        }
    } else {
        //if visible sentinelLayer for each add swath layer
        activeSentinelLayers.forEach((sentinelLayer) => {
            if(sentinelLayer.totalCount > 0) {
                swathLayers.push({
                    type: 'swath',
                    key:`swath_${sentinelLayer.satKey}_${sentinelLayer.layerKey}`,
                    sentinelLayerKey: sentinelLayer.layerKey,
                    satName: sentinelLayer.satKey,
                    tle: getOrbitForLayer(orbitsSubstate, `orbit-${sentinelLayer.satKey}`),
                })
            }
        })
    }

    let statisticsLayers = [];
    statisticsLayers = visibleStatistics.map(s => (
        {
            type: 'statistics',
            key:`statistics_${s}`,
            sensornames: [getSatelliteForLayer(satellitesSubstate, s).statisticsKey],
            name: s,
            selectTime,
            satName: s,
        }))
    return [...activeSentinelLayers, ...searchLayers, ...orbitLayers, ...satellitesLayers, ...acquisitionPlanLayers, ...swathLayers, ...statisticsLayers];
})((state, selectTime) => {
    const stringSelectTime = selectTime ? selectTime.toString() : '';
    const activeLayers = common.getByPath(state, ['activeLayers']);
    const orbitSubstate = getOrbitsSubstate(state);
    const satellitesSubstate = getSatellitesSubstate(state);
    const endTime = selectTime;
    const selectTimePastOrCurrent = getSelectTimePastOrCurrent(state);
    const acquisitionPlans = getPlansForDate(state, selectTime);
    const visibleAcquisitionsPlans = getVisibleAcquisitionsPlans(state);
    const visibleStatistics = getVisibleStatistics(state);
    let acquisitionPlanLayers = '';
    if(selectTimePastOrCurrent){
        acquisitionPlanLayers = getPlansKeys(acquisitionPlans.filter(p => visibleAcquisitionsPlans.includes(p.key)));
    };

    let swathLayers = '';
    if(selectTimePastOrCurrent){
        swathLayers = getSwathKeysFromAPS(acquisitionPlans.filter(p => visibleAcquisitionsPlans.includes(p.key)));
    } else {
        swathLayers = activeLayers.map(l => `swath-${l.layerKey}${l.satKey}${getBeginTime(selectTime, getSatelliteForLayer(satellitesSubstate, l.satKey).productsTimeWindow)}${endTime}`).join(',');
    };
    
    let statisticsLayers = '';
    statisticsLayers = visibleStatistics.join(',');

    const orbitKeys = orbitSubstate.map(l => l.key).join(',');
    const satellitesKeys = satellitesSubstate.map(s => s.id).join(',');
    const activeLayersKeys = activeLayers.map(l => `${l.layerKey}${l.satKey}${getBeginTime(selectTime, getSatelliteForLayer(satellitesSubstate, l.satKey).productsTimeWindow)}${endTime}`).join(',');
    const cacheKey = `pastOrcurrent${selectTimePastOrCurrent}-${stringSelectTime}-${satellitesKeys}-${orbitKeys}-${activeLayersKeys}-${acquisitionPlanLayers}-${swathLayers}-${statisticsLayers}`;    
    return cacheKey === '' ? 'nodata' : cacheKey;
});

export const getActiveLayerByKey = createCachedSelector(
    (activeLayers) => activeLayers,
    (activeLayers, layerKey) => layerKey,
    (activeLayers, layerKey, satKey) => satKey,
    (activeLayers, layerKey, satKey) => activeLayers.find(l => l.layerKey === layerKey && l.satKey === satKey))((state, layerKey, satKey) => `${satKey}-${layerKey}`);


export default {
    getCurrentTime,
    getFollowNow,
    getSelectTime,
    getInfoModal,
}