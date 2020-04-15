export const getSwathKeysFromAPS = (aps) => aps && aps.length ? aps.map(a => `swath_${a.start}_${a.end}`).join('') : '';

export const getSwathKey = (swathCfg) => {
    //identify swath for past or current future
    if(swathCfg && swathCfg.apsIDKey) {
        return swathCfg.apsIDKey;
    }
};
