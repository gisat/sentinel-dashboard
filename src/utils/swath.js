import WorldWind from 'webworldwind-esa';
const {
    Color
} = WorldWind;

export const getSwathKeysFromAPS = (aps) => aps && aps.length ? aps.map(a => `swath_${a.start}_${a.end}`).join('') : '';

export const getSwathKey = (swathCfg) => {
    //identify swath for past or current future
    if(swathCfg && swathCfg.apsIDKey) {
        return swathCfg.apsIDKey;
    } else if(swathCfg && swathCfg.sentinelLayerKey) {
        return `swath-${swathCfg.sentinelLayerKey}-${swathCfg.satName}`
    }
};

const satellitesSwathColors = {
    s1a: {
        IW: 'FF0000FF',
        EW: 'FF00FF00',
        SM: 'FF000000',
        WV: 'FFFFFFFF',
        RFC: 'FF000000'
    },
    s1b: {
        IW: 'FF0000FF',
        EW: 'FF00FF00',
        SM: 'FF000000',
        WV: 'FFFFFFFF',
        RFC: 'FF000000'
    },
    s2a: {
        'DARK-O': '407f7f7f',
        NOBS: '4000ff00',
        VIC: 'ffff00ff'
    },
    s2b: {
        DARK: '407f7f7f',
        NOBS: '40ffff00',
        VIC: '40ff00ff'
    },
    s3a: {
        "Earth Observation": 'FF0000FF',
    },
    s3b: {
        "Earth Observation": 'FF0000FF',
    }
}

export const getColorForSatType = (satKey, swatMode) => {
    const hex = satellitesSwathColors[satKey][swatMode];
    return Color.colorFromKmlHex(hex);
}