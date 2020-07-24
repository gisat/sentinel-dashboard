import {parseWKT} from "./WKTParser";

export default function parseJSON(response) {
    const featureCollection = {
        id: '',
        type: 'FeatureCollection',
        features: [],
        properties: {}
    };

    let root;
    try {
        const jsonData = JSON.parse(response);
        root = jsonData.feed;
    }
    catch (e) {
        return featureCollection;
    }

    featureCollection.properties.totalResults = +root['opensearch:totalResults'] || 0;
    featureCollection.properties.startIndex = +root['opensearch:startIndex'] || 0;
    featureCollection.properties.itemsPerPage = +root['opensearch:itemsPerPage'] || 0;

    if (Array.isArray(root.link)) {
        if (!featureCollection.properties.links) {
            featureCollection.properties.links = {};
        }
        root.link.forEach(link => {
            const rel = link.rel;
            if (!rel) {
                return;
            }
            featureCollection.properties.links[rel] = link.href;
        });
    }

    if (Array.isArray(root.entry)) {
        featureCollection.features = root.entry.map(parseEntry);
    }
    else if (root.entry){
        featureCollection.features.push(parseEntry(root.entry));
    }

    return featureCollection;

}

export function parseEntry(entryObj) {
    const feature = {
        id: '',
        type: 'Feature',
        bbox: [],
        geometry: null,
        properties: {}
    };

    const properties = feature.properties;

    if (entryObj.date) {
        if (Array.isArray(entryObj.date)) {
            entryObj.date.forEach(prop => {
                if (prop.name) {
                    properties[prop.name] = new Date(prop.content).getTime();
                }
            });
        }
        else if (entryObj.date.name) {
            properties[entryObj.date.name] = new Date(entryObj.date.content).getTime();
        }
    }

    if (entryObj.double) {
        if (Array.isArray(entryObj.double)) {
            entryObj.double.forEach(prop => {
                if (prop.name) {
                    properties[prop.name] = +prop.content;
                }
            });
        }
        else if (entryObj.double.name) {
            properties[entryObj.double.name] = +entryObj.double.content;
        }
    }

    if (entryObj.int) {
        if (Array.isArray(entryObj.int)) {
            entryObj.int.forEach(prop => {
                if (prop.name) {
                    properties[prop.name] = +prop.content;
                }
            });
        }
        else if (entryObj.int.name) {
            properties[entryObj.int.name] = +entryObj.int.content;
        }
    }

    if (entryObj.link) {
        if (Array.isArray(entryObj.link)) {
            entryObj.link.forEach(prop => {
                if (prop.rel === 'icon') {
                    properties.quickLook = prop.href;
                }
            });
        }
        else if (entryObj.link.rel === 'icon') {
            properties.quickLook = entryObj.link.href;
        }
    }

    if (entryObj.str) {
        for (const [key, prop] of Object.entries(entryObj.str)) {
            if (prop.name === 'gmlfootprint' || prop.name === 'footprint') {
                continue;
            }

            if (prop.name && prop.name !== 'real_footprint') {
                properties[prop.name] = prop.content;
            }

            if (prop.name === 'real_footprint') {
                feature.geometry = parseWKT(prop.content);
            }
        };

        if (!feature.geometry) {
            const footprint = entryObj.str.footprint;
            if (footprint) {
                feature.geometry = parseWKT(footprint.content);
            }
        }
    }
    if (!properties.tileid && (properties.filename || entryObj.title)) {
        //S2A_MSIL2A_20180612T095031_N0208_R079_T33SUB_20180612T123902
        let filename = properties.filename || entryObj.title;
        const [sat, productLevel, sensingDate, processingBaselineNumber,
            relativeOrbitNumber, tileId, productDiscriminator] = filename.trim().split('_');
        properties.tileid = tileId.slice(1);
    }

    return feature;
}