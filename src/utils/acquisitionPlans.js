const getSatAPSUrl = (satKey) => `http://eoapps.solenix.ch/aps/${satKey}/`;
const getSatIntervalAPSUrl = (satKey, ASPfile) => `http://eoapps.solenix.ch/aps/${satKey}/${ASPfile}`;
// const satellites = ['s1a', 's1b', 's2a', 's2b', 's3a', 's3b', 's5p'];
const satellites = ['s1a', 's1b', 's2a', 's2b'];
//cache tle in Map
const cache = new Map();

const parseAPSfiles = (result) => {
        const kmls = result.split('\n');

        return kmls.reduce((acc, kmlName) => {
            if (kmlName === '') {
                return acc;
            } else {
                let kml = kmlName.replace('.kml', '').split('_');
                return [...acc, {
                    start: kml[1],
                    end: kml[2],
                    name: kmlName,
                }];
            }
        }, [])
}

/**
 * @param {string} satKey - Satellite key for acquisition plans
 */
export const getAcquisitionPlans = async (satKey) => {
    
    let aps = null;

    if(cache.has(satKey)) {
        aps = cache.get(satKey);
        //check if aps is Promise
        if(aps && typeof aps.then == 'function') {
            aps = await aps;
            return aps;
        } else {
            return aps;
        }
    } else {
        const request = fetch(getSatAPSUrl(satKey)).then(response => response.text()).then(text => parseAPSfiles(text));
        cache.set(satKey, request);
        return await request;
    }
}

export const getAllAcquisitionPlans = async () => {
    return await Promise.all(
        satellites.map(async (satKey) => {
            const aps = await getAcquisitionPlans(satKey);
            return {
                key: satKey,
                aps,
            }
        })
    );
};