const getUrl = (dateString) => `http://eoapps.solenix.ch/tle-server/${dateString}/resource.txt`

//cache tle in Map
const cache = new Map();

const SENTINELTLENAMES = ['SENTINEL-1A', 'SENTINEL-1B', 'SENTINEL-2A', 'SENTINEL-2B', 'SENTINEL-3A', 'SENTINEL-3B', 'SENTINEL-5P']
const SENTINELTLEKEYSPAIRS = [['SENTINEL-1A', 's1a'], ['SENTINEL-1B', 's1b'], ['SENTINEL-2A', 's2a'], ['SENTINEL-2B', 's2b'], ['SENTINEL-3A', 's3a'], ['SENTINEL-3B', 's3b'], ['SENTINEL-5P', 's5p']]

const parseSatellitesData = (text) => {
    const lines = text.split('\r\n');
    const satellites = [];
    lines.forEach((line, index) => {
            //satellite name is on every thirth line;
            const isSatNameLine = index % 3 === 0;
            if(isSatNameLine) {
                satellites.push({
                    name: line.trim(),
                    line1: lines[index + 1],
                    line2: lines[index + 2]
                });
            }
    });
    return satellites;
}

const transformTleFormat = (tle) => {
    const satKey = SENTINELTLEKEYSPAIRS.find((s => s[0] === tle.name))[1];
    return {
        key: `orbit-${satKey}`,
        specs: [
            tle.line1,
            tle.line2,
        ]
    }
}

/**
 * @param {string} dateString - Date string in format YYYY-MM-DD like "2019-06-07"
 */
export const getTle = async (dateString) => {
    
    let tle = null;
    if(cache.has(dateString)) {
        tle = cache.get(dateString);
        //check if tle is Promise
        if(tle && typeof tle.then == 'function') {
            tle = await tle;
            return tle;
        } else {
            return tle;
        }
    } else {
        const request = fetch(getUrl(dateString)).then(response => response.text()).then(text => parseSatellitesData(text).filter(t => SENTINELTLENAMES.includes(t.name)).map(transformTleFormat));
        cache.set(dateString, request);
        const orbits = await request;
        
        return orbits;
    }
}

