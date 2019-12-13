import createCachedSelector from 're-reselect';
import momentjs from 'moment';
import common from './_common';
import {getSubstate as getOrbitsSubstate} from './data/orbits';
import {getSubstate as getSatellitesSubstate} from './data/satellites';
import {getSubstate as getAcquisitionPlansSubstate, getPlansForDate} from './data/acquisitionPlans';
import {getVisibleAcquisitionsPlans} from './map';
import {getPlansKeys} from '../../utils/acquisitionPlans';
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
        const beginDataTime = momentjs(selectTime).subtract(5, 'minutes').toDate().toString();
        return beginDataTime;
    }
)((state) => {
    const selectTime = new Date(getSelectTime(state));
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
const getEndDataTime = getSelectTime;
export const getActiveLayers = createCachedSelector(
    getPureActiveLayers,
    getBeginDataTime,
    getEndDataTime,
    getSelectTimePastOrCurrent,
    getOrbitsSubstate,
    getSatellitesSubstate,
    getPlansForDate,
    getVisibleAcquisitionsPlans,
    (state, selectTime) => selectTime,
    getFocusedSattelite,
    (activeLayers, beginTime, endTime, selectTimePastOrCurrent, orbitsSubstate, satellitesSubstate, acquisitionPlans, visibleAcquisitionsPlans, selectTime, focusedSatellite) => {

    const activeLayersWithDates = []

    activeLayers.forEach(l => {
        const satData = getSatDataByKey(l.satKey);
        const layer = {...l,
            type: 'sentinelData',
            beginTime: new Date(beginTime),
            endTime: new Date(endTime),
            disabled: selectTimePastOrCurrent || !satellitesUtils.isSatelliteReleaseBeforeDate({satData}, selectTime),
            satData,
        }
        activeLayersWithDates.push(layer);
    });

    const orbitLayers = orbitsSubstate.filter((o) =>
        satellitesUtils.filterByReleasedSatellite(o, satellitesSubstate, selectTime)
        ).filter((o) =>
            satellitesUtils.filterByActiveSatellite(o, focusedSatellite)
        ).map(o => ({...o, type: 'orbit'}));    
    const getOrbitForLayer = (orbitKey) => {
        const orbit = orbitsSubstate.find(o => o.key === orbitKey);
        return (orbit && orbit.specs) || null;
    }
    
    const satellitesLayers = satellitesSubstate.filter((s) => satellitesUtils.isSatelliteReleaseBeforeDate(s, selectTime)).map(s => ({key:s.id, name: s.name, model: s.model, type: 'satellite', satData: s.satData, time: selectTime, tle: getOrbitForLayer(`orbit-${s.id}`)}));
    let acquisitionPlanLayers = [];
    
    //todo filter by visible APS data

    if(selectTimePastOrCurrent) {

        acquisitionPlanLayers = acquisitionPlans.filter(p => visibleAcquisitionsPlans.includes(p.key)).map(aps => ({key:`acquisitionPlans_${aps.key}`, name: aps.key, type: 'acquisitionPlan', plans: aps.plans, selectTime, satName:aps.key, tle: getOrbitForLayer(`orbit-${aps.key}`)}));
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
    const visibleAcquisitionsPlans = getVisibleAcquisitionsPlans(state);
    let acquisitionPlanLayers = '';
    if(selectTimePastOrCurrent){
        acquisitionPlanLayers = getPlansKeys(acquisitionPlans.filter(p => visibleAcquisitionsPlans.includes(p.key)));
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