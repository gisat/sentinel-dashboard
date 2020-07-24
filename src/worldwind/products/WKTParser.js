import WorldWind from 'webworldwind-esa';

const {
    Location
} = WorldWind;


export function parseWKT(text) {
    const i = text.indexOf('(');
    const type = text.slice(0, i).trim();
    const geometry = text.slice(i + 1, -1).trim();
    if (type.toLowerCase() === 'polygon') {
        return parsePolygon(geometry);
    }
    else if (type.toLowerCase() === 'multipolygon') {
        //console.log('geometry', geometry);
        const polygonStrings = splitMultiPolygon(geometry);
        const polygons = polygonStrings.map(geo => {
            const polygon = parsePolygon(geo);
            return polygon[0];
        });
        //console.log('polygons', polygons);
        return polygons;
    }
}

function splitMultiPolygon(geometryString) {
    const polygons = [];
    let startIndex = 0;
    let opened = 0;
    for (var i = 0, len = geometryString.length; i < len; i++) {
        var char = geometryString[i];
        if (char === '(') {
            if (opened === 0) {
                startIndex = i;
            }
            opened++;
        }
        else if (char === ')') {
            opened--;
            if (opened === 0) {
                polygons.push(geometryString.slice(startIndex, i));
            }
        }
    }
    return polygons;
}

function parsePolygon(geometry) {
    const res = [];
    let currentPolygon = '';
    for (var i = 0, len = geometry.length; i < len; i++) {
        var char = geometry[i];
        if (char === '(') {
            currentPolygon = '';
        }
        else if (char === ')') {
            var pairs = currentPolygon.split(',');
            var locations = pairs.map(pair => {
                const lonLat = pair.trim().split(' ');
                const lon = +lonLat[0];
                const lat = +lonLat[1];
                return new Location(lat, lon);
            });
            res.push(locations);
        }
        else {
            currentPolygon += char;
        }
    }
    return res;
}