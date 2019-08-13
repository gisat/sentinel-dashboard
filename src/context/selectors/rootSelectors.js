import createCachedSelector from 're-reselect';
import momentjs from 'moment';
import common from './_common';

export const getCurrentTime = createCachedSelector(
    (state) => common.getByPath(state, ['currentTime'])
)((state) => common.getByPath(state, ['currentTime']))

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
export function getLandscape (state)  {return common.getByPath(state, ['landscape'])};

export function getFocusedSattelite (state)  {return common.getByPath(state, ['focus'])};

//round time on minutes to prevent rerender on every second?
const getEndDataTime = getSelectTime;

export const getActiveLayers = createCachedSelector(
    getPureActiveLayers,
    getBeginDataTime,
    getEndDataTime,
    (activeLayers, beginTime, endTime) => {

    const activeLayersWithDates = []

    activeLayers.forEach(l => {
        const layer = {...l,
            beginTime: new Date(beginTime),
            endTime: new Date(endTime),
        }
        activeLayersWithDates.push(layer);
    });
    
    return activeLayersWithDates;
})((state) => {
    const activeLayers = common.getByPath(state, ['activeLayers']);
    const beginTime = getBeginDataTime(state);
    const endTime = getEndDataTime(state);
    
    const cacheKey = activeLayers.map(l => `${l.layerKey}${l.satKey}${beginTime}${endTime}`).join(',');
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
}