import createCachedSelector from 're-reselect';
import momentjs from 'moment';
import common from './_common';
import {getSubstate as getOrbitsSubstate} from './data/orbits';
import {getSubstate as getSatellitesSubstate} from './data/satellites';
import {getSubstate as getAcquisitionPlansSubstate, getPlansForDate} from './data/acquisitionPlans';
import {getPlansKeys} from '../../utils/acquisitionPlans';
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
        return selectTime
    }
)((state) => {
    const key = common.getByPath(state, ['selectTime'])
    return key;
})

//round time on minutes to prevent rerender on every second?
export const getBeginDataTime = createCachedSelector(
    getSelectTime,
    (selectTime) => {
        const beginDataTime = momentjs(selectTime).subtract(1, 'hour').toDate().toString();
        return beginDataTime;
    }
)((state) => {
    const selectTime = new Date(getSelectTime(state));
    const cacheKey = momentjs(selectTime).subtract(1, 'hour').toDate().toString();
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

export function getPeriodLimit (state)  {return common.getByPath(state, ['periodLimit'])};

export function getLandscape (state)  {return common.getByPath(state, ['landscape'])};

export function getFocusedSattelite (state)  {return common.getByPath(state, ['focus'])};

//round time on minutes to prevent rerender on every second?
const getEndDataTime = getSelectTime;
export const getActiveLayers = createCachedSelector(
    getPureActiveLayers,
    getBeginDataTime,
    getEndDataTime,
    getSelectTimePastOrCurrent,
    getOrbitsSubstate,
    getSatellitesSubstate,
    getPlansForDate,
    (state, selectTime) => selectTime,
    (activeLayers, beginTime, endTime, selectTimePastOrCurrent, orbitsSubstate, satellitesSubstate, acquisitionPlans, selectTime) => {

    const activeLayersWithDates = []

    activeLayers.forEach(l => {
        const layer = {...l,
            type: 'sentinelData',
            beginTime: new Date(beginTime),
            endTime: new Date(endTime),
            disabled: selectTimePastOrCurrent
        }
        activeLayersWithDates.push(layer);
    });

    const orbitLayers = orbitsSubstate.map(o => ({...o, type: 'orbit'}));
    const satellitesLayers = satellitesSubstate.map(s => ({key:s.id, name: s.name, model: s.model, type: 'satellite', satData: s.satData, time: selectTime}));
    let acquisitionPlanLayers = [];
    if(selectTimePastOrCurrent){
        acquisitionPlanLayers = acquisitionPlans.map(aps => ({key:`acquisitionPlans_${aps.key}`, name: aps.key, type: 'acquisitionPlan', plans: aps.plans, selectTime}));
    };
    activeLayersWithDates.push(...orbitLayers, ...satellitesLayers, ...acquisitionPlanLayers);
    
    return activeLayersWithDates;
})((state, selectTime) => {
    const stringSelectTime = selectTime ? selectTime.toString() : '';
    const activeLayers = common.getByPath(state, ['activeLayers']);
    const orbitSubstate = getOrbitsSubstate(state);
    const satellitesSubstate = getSatellitesSubstate(state);
    const beginTime = getBeginDataTime(state);
    const endTime = getEndDataTime(state);
    const selectTimePastOrCurrent = getSelectTimePastOrCurrent(state);
    const acquisitionPlans = getPlansForDate(state, selectTime);
    let acquisitionPlanLayers = '';
    if(selectTimePastOrCurrent){
        acquisitionPlanLayers = getPlansKeys(acquisitionPlans);
    };

    const orbitKeys = orbitSubstate.map(l => l.key).join(',');
    const satellitesKeys = satellitesSubstate.map(s => s.id).join(',');
    const activeLayersKeys = activeLayers.map(l => `${l.layerKey}${l.satKey}${beginTime}${endTime}`).join(',');
    const cacheKey = `${stringSelectTime}-${satellitesKeys}-${orbitKeys}-${activeLayersKeys}-${acquisitionPlanLayers}`;
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