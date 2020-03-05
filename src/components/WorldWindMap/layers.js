import WorldWind from 'webworldwind-esa';
import WordWindX from 'webworldwind-x';
import createCachedSelector from 're-reselect';
import './style.css';
import SatelliteModelLayer from './SatelliteModelLayer';
import OrbitLayer from './OrbitLayer';
import SentinelCloudlessLayer from './SentinelCloudlessLayer';
import SentinelTopologyLayer from './SentinelTopologyLayer';
import AcquisitionPlanLayer from './AcquisitionPlanLayer';
import SwathLayer from './SwathLayer';
import {getPlansKeys} from '../../utils/acquisitionPlans';
import wmsLayerUtils from './utils/wmsLayer';
import {getBoundaries, productBounds} from '../../utils/product';
import {getModel} from './satellitesModels';
import SciHubProducts from '../../worldwind/products/Products';
import {hubPassword, hubUsername} from "../../config";

window.WorldWind.configuration.baseUrl = `${window.location.origin}${window.location.pathname}`;
console.log("WorldWind.configuration.baseUrl set to: ", window.WorldWind.configuration.baseUrl);

const {
    StarFieldLayer,
    EoUtils,
} = WordWindX;

const {
    RenderableLayer,
    SurfacePolygon,
    AtmosphereLayer,
} = WorldWind;

const {getLayerFromCapabilitiesUrl} = wmsLayerUtils;
const csiRenderablesCache = new window.Map();
const searchCache = new window.Map();
const layersCache = new window.Map();
const productsScihub = new SciHubProducts(csiRenderablesCache, searchCache, fetchWithCredentials);
const defaultBackgroundLayer = new SentinelCloudlessLayer();
const defaultStarfieldLayer = new StarFieldLayer('./images/stars.json');
const defaultAtmosphereLayer = new AtmosphereLayer('./images/dnb_land_ocean_ice_2012.png');
const productsRequests = new window.Map();
const defaultTopologyLayer = new SentinelTopologyLayer();

export function getLayerKeyFromConfig (layerConfig) {
    return `${layerConfig.satKey}-${layerConfig.layerKey}`;   
}

export function getLayerKeySCIHubResult (layerConfig) {
    return `${layerConfig.id._text}`;
}

export function getLayerIdFromConfig (layerConfig) {
    if(layerConfig.satKey && layerConfig.layerKey && layerConfig.beginTime && layerConfig.endTime) {
        return `${layerConfig.satKey}-${layerConfig.layerKey}-${layerConfig.beginTime.toString()}-${layerConfig.endTime.toString()}`;   
    } else {
        return layerConfig.key;
    }
}

export function getProductByKey (productKey) {
    return csiRenderablesCache.get(productKey);
}

const filterOrbitLayersConfigs = (layersConfig) => {
    return layersConfig.filter(l => l.type === 'orbit');
}

const filterAcquisitionPlanLayersConfigs = (layersConfig) => {
    return layersConfig.filter(l => l.type === 'acquisitionPlan');
}

const filterSatelliteLayersConfigs = (layersConfig) => {
    return layersConfig.filter(l => l.type === 'satellite');
}

const filterSentinelDataLayersConfigs = (layersConfig) => {
    return layersConfig.filter(l => l.type === 'sentinelData');
}

export function getLayerByName (name, layers) {
    return layers.find(l => l.displayName === name);
}

function fetchWithCredentials (url, options = {}) {
    if (!options.headers) {
        options.headers = {};
    }
    options.headers.Authorization = `Basic ${window.btoa(`${hubUsername}:${hubPassword}`)}`;

    const fetch = window.fetch(url, options);
    return fetch;
};

const getSentinelLayer = (layerConfig) => {
    const layerKey = getLayerKeyFromConfig(layerConfig);
    const cacheLayer = layersCache.get(layerKey);
    if(cacheLayer) {
        return cacheLayer;
    } else {
        const layer = new RenderableLayer(layerKey);
        layersCache.set(layerKey, layer);
        return layer;
    }
}

const getFootprintLayer = (layerConfig) => {
    const layerKey = getLayerKeySCIHubResult(layerConfig);
    const cacheLayer = layersCache.get(layerKey);
    
    if(cacheLayer) {
        return cacheLayer;
    } else {
        const layer = new RenderableLayer(layerKey);
        layersCache.set(layerKey, layer);
        return layer;
    }
}

const getOrbitLayer = (layerConfig, time = new Date(), wwd, currentTime) => {
    const layerKey = layerConfig.key;
    const cacheLayer = layersCache.get(layerKey);

    //set specs

    if(cacheLayer) {
        if(time.toString() !== cacheLayer.selectTime.toString() || currentTime.toString() !== cacheLayer.currentTime.toString()) {
            cacheLayer.setTime(new Date(currentTime), new Date(time));
        }

        if(layerConfig.specs[0] !== (cacheLayer.satRec && cacheLayer.satRec[0]) || layerConfig.specs[1] !== (cacheLayer.satRec && cacheLayer.satRec[1])) {
            cacheLayer.setSatRec(layerConfig.specs);
        }

        return cacheLayer;
    } else {
        const layer = new OrbitLayer({key: layerKey, satRec: layerConfig.specs, time, currentTime});
        layer.setRerender(() => wwd.redraw());
        layersCache.set(layerKey, layer);
        return layer;
    }
}

const getAcquisitionPlanLayer = (layerConfig, wwd, time, onLayerChanged) => {
    const layerKey = layerConfig.key;
    const cacheLayer = layersCache.get(layerKey);
    const plans = layerConfig.plans;

    if(cacheLayer) {
        const plansKeys = getPlansKeys(plans);
        const cacheLayerPlansKeys = getPlansKeys(cacheLayer.plans);
        
        if(plansKeys !== cacheLayerPlansKeys) {
            cacheLayer.setPlans(plans);
        }

        if(time.getTime() !== cacheLayer.time.getTime()) {
            cacheLayer.setTime(time);
        }
        return cacheLayer;
    } else {
        const layer = new AcquisitionPlanLayer({key: layerKey, satName: layerConfig.satName, time: time, onLayerChanged, range: layerConfig.range});
        layer.setPlans(plans);
        layer.setRerender(() => wwd.redraw());
        layersCache.set(layerKey, layer);
        return layer;
    }
}

const getSwathLayer = (layerConfig, wwd, time) => {
    const layerKey = `swath_${layerConfig.key}`;
    const layerAcquisitionKey = layerConfig.key;
    const cacheLayer = layersCache.get(layerKey);
    const cacheLayerAcquisition = layersCache.get(layerAcquisitionKey);
    // const plans = layerConfig.plans;

    if(cacheLayer) {
        //if changed TLE in config
        if((layerConfig.tle && layerConfig.tle[0]) !== (cacheLayer.Tle && cacheLayer.Tle[0]) || (layerConfig.tle && layerConfig.tle[1]) !== (cacheLayer.Tle && cacheLayer.Tle[1])) {
            cacheLayer.setTle(layerConfig.tle);
        }

        if(time.toString() !== cacheLayer.time.toString()) {
            cacheLayer.setTime(time);
            const swath = cacheLayerAcquisition.getFootprints(0);
            swath.then(data => {
                //FIXME - remove
                // console.log(data && data.outlines);
                if(data && data.outlines && data.outlines.length > 0) {
                    const color = data.interiors[0].attributes.interiorColor;
                    const type = data.interiors[0].kmlProps.Mode;
                    cacheLayer.setType(type);
                    cacheLayer.setColor(color);
                    cacheLayer.setVisible(true);
                } else {
                    cacheLayer.setVisible(false);
                }
            })
        }

        return cacheLayer;
    } else {
        const layer = new SwathLayer({key: layerKey, satName: layerConfig.satName, time: time, tle: layerConfig.tle});
        layer.setRerender(() => wwd.redraw());
        layersCache.set(layerKey, layer);
        return layer;
    }
}

const getSatelliteLayer = (layerConfig, time, wwd) => {
    const layerKey = layerConfig.key;
    const cacheLayer = layersCache.get(layerKey);
    if(cacheLayer) {
        //upadte time on change
        if(time.toString() !== cacheLayer.time.toString()) {
            cacheLayer.setTime(time);
        }

        //if changed TLE in config
        if((layerConfig.tle && layerConfig.tle[0]) !== (cacheLayer.Tle && cacheLayer.Tle[0]) || (layerConfig.tle && layerConfig.tle[1]) !== (cacheLayer.Tle && cacheLayer.Tle[1])) {
            cacheLayer.setTle(layerConfig.tle);
        }

        return cacheLayer;
    } else {
        const options = {
            rotations: layerConfig.satData.rotations,
            preRotations: layerConfig.satData.preRotations,
            scale: layerConfig.satData.scale,
            translations: layerConfig.satData.translations,
            ignoreLocalTransforms: layerConfig.satData.ignoreLocalTransforms,
        }
        const layer = new SatelliteModelLayer({key: layerKey, time: time}, options);
        layer.setRerender(() => wwd.redraw());
        getModel(`${layerConfig.satData.filePath}${layerConfig.satData.fileName}`, layerKey).then(
            (model) => {
                const satrec = EoUtils.computeSatrec(layerConfig.satData.tleLineOne, layerConfig.satData.tleLineTwo);
                const position = EoUtils.getOrbitPosition(satrec, new Date(time));
                layer.setModel(model, options, position)
                layer.setTle([layerConfig.satData.tleLineOne, layerConfig.satData.tleLineTwo]);
            }
        );
        layersCache.set(layerKey, layer);
        return layer;
    }
}

export const getLayers = createCachedSelector([
    (layersConfig) => layersConfig,
    (layersConfig, time) => time,
    (layersConfig, time, wwd) => wwd,
    (layersConfig, time, wwd, onLayerChanged) => onLayerChanged,
    (layersConfig, time, wwd, onLayerChanged, currentTime) => currentTime,
    (layersConfig, time, wwd, onLayerChanged, currentTime, searchResult) => searchResult,
], (layersConfig, time, wwd, onLayerChanged, currentTime, searchResult) => {
    defaultStarfieldLayer.time = time;
    defaultAtmosphereLayer.time = time;
    const layers = [
        defaultStarfieldLayer,
        defaultBackgroundLayer,
        defaultAtmosphereLayer,
        defaultTopologyLayer
    ];

    const sentinelDataLayersConfigs = filterSentinelDataLayersConfigs(layersConfig);
    const sentinelLayers = sentinelDataLayersConfigs.map(getSentinelLayer);
    
    const orbitLayersConfigs = filterOrbitLayersConfigs(layersConfig);
    const orbitLayers = orbitLayersConfigs.map((o) => getOrbitLayer(o, time, wwd, currentTime));
    const satellitesLayersConfigs = filterSatelliteLayersConfigs(layersConfig);
    const satelliteLayers = satellitesLayersConfigs.map((s) => getSatelliteLayer(s, time, wwd));
    const acquisitionPlanLayersConfigs = filterAcquisitionPlanLayersConfigs(layersConfig);
    const acquisitionPlanLayers = acquisitionPlanLayersConfigs.map((s) => getAcquisitionPlanLayer(s, wwd, time, onLayerChanged));
    const swathLayers = acquisitionPlanLayersConfigs.map((s) => getSwathLayer(s, wwd, time));
    const searchLayer = searchResult ? [getFootprintLayer(searchResult)] : [];
    return [...searchLayer, ...layers, ...sentinelLayers, ...orbitLayers, ...satelliteLayers, ...acquisitionPlanLayers, ...swathLayers];
})((layersConfig, time, wwd, onLayerChanged, currentTime, searchResult) => {
    const stringTime = time ? time.toString() : '';
    const stringCurrentTime = currentTime ? currentTime.toString() : '';
    const sentinelDataLayersConfigs = filterSentinelDataLayersConfigs(layersConfig);
    const orbitLayersConfigs = filterOrbitLayersConfigs(layersConfig);
    const satellitesLayersConfigs = filterSatelliteLayersConfigs(layersConfig);

    const acquisitionPlanLayers = filterAcquisitionPlanLayersConfigs(layersConfig);

    const orbitKeys = orbitLayersConfigs.map(l => l.key).join(',');
    const satellitesKeys = satellitesLayersConfigs.map(l => l.key).join(',');
    const activeLayersKeys = sentinelDataLayersConfigs.map((layerConfig) => `${getLayerKeyFromConfig(layerConfig)}-${layerConfig.beginTime.toString()}-${layerConfig.endTime.toString()}`).join(',');
    const acquisitionPlanLayersKeys = acquisitionPlanLayers.map((aps) => `${aps.key}_${getPlansKeys(aps.plans)}`);
    const searchLayerKey = searchResult  ? getLayerKeySCIHubResult(searchResult) : '';
    const cacheKey = `${searchLayerKey}-${stringTime}-${stringCurrentTime}-${satellitesKeys}-${orbitKeys}-${activeLayersKeys}-${acquisitionPlanLayersKeys}`;
    return cacheKey;
});

const getSciProducts = async (layerConfig) => {
    try {
        let beginTime = layerConfig.beginTime;
        let endTime = layerConfig.endTime;

        const productsLocal = productsScihub.products({
            shortName: layerConfig.satData.shortName,
            products: [layerConfig.layerKey],
            beginTime: beginTime,
            endTime: endTime
        });
        return await productsLocal;
    } catch {
        console.error('Can not get products.')
    }
}

export const setRenderablesFromConfig = async (layer, layerConfig, redrawCallback, onLayerChanged, cancelled) => {
    let rejected = false;
    cancelled.catch(() => {
        rejected = true;
    })
    //return promise
    const msg = {
        status: 'ok',
        loadedCount: null,
        totalCount: null,
    }
    const requests = [];
    const status = 'loading';
    let loadedCount = 0;
    let errors = [];
    let totalCount = 0;
    redrawCallback();
    // const changedLayer = {
    //     satKey: layerConfig.satKey,
    //     layerKey: layerConfig.layerKey
    // }
    // onLayerChanged(changedLayer, {status, loadedCount, totalCount})

    const products = productsScihub.processProducts({entry: layerConfig.results})

    // const products = await getSciProducts(layerConfig);
    totalCount = products.length;
    if(rejected) {
        return
    }

    const productsIDs = products.map(p => p.id());

    const renderablesToRemove = [];
    const renderedRenderables = [];
    layer.renderables.forEach((r => {
        const id = r && r.userProperties && r.userProperties.key;
        renderedRenderables.push(id);
        if(!productsIDs.includes(id)) {
            renderablesToRemove.push(r) ;
        }
    }))

    //remove renderables
    renderablesToRemove.forEach(r => layer.removeRenderable(r));

    //identify new renderables
    const newRenderables = products.filter((p) => {
        const productID = p.id();
        return !renderedRenderables.includes(productID);
    })

    loadedCount = layer.renderables.length;

    for(let productIndex = 0; productIndex < newRenderables.length; productIndex++) {
        const key = newRenderables[productIndex].id();
        const request = newRenderables[productIndex].renderable().then((result) => {
            
            
            if(rejected) {
                return
            }
            const boundaries = getBoundaries(result);

            let uncompleateBoundaries = false;
            if(boundaries && boundaries.length > 0 && boundaries[0].length < 4) {
                uncompleateBoundaries = true;
            }
            const error = result.error instanceof Error;

            if(!error && !uncompleateBoundaries) {
                loadedCount++;
                result['userProperties'] = {
                    key
                }
                layer.addRenderable(result);
                redrawCallback();
                // onLayerChanged(changedLayer, {status, loadedCount, totalCount});
            } else {
                //Add also not loaded footprints
                loadedCount++;
                const polygon = productBounds(boundaries);
                polygon['userProperties'] = {
                    key
                }


                layer.addRenderable(polygon);

                errors.push(error);
                redrawCallback();
                // onLayerChanged(changedLayer, {status, loadedCount, totalCount});

            }
        }, (err) => {
            // debugger
        });
        requests.push(request);
    }

    await Promise.all(requests.map(p => p.catch(e => e)));
    // onLayerChanged(changedLayer, {status: 'ok', loadedCount, totalCount});

    return msg;
}

export const setRenderables = async (layer, layerConfig, redrawCallback, onLayerChanged, cancelled) => {
    let rejected = false;
    cancelled.catch(() => {
        rejected = true;
    })
    //return promise
    const msg = {
        status: 'ok',
        loadedCount: null,
        totalCount: null,
    }
    const requests = [];
    const status = 'loading';
    let loadedCount = 0;
    let errors = [];
    let totalCount = 0;
    redrawCallback();
    const changedLayer = {
        satKey: layerConfig.satKey,
        layerKey: layerConfig.layerKey
    }
    onLayerChanged(changedLayer, {status, loadedCount, totalCount})

    const products = await getSciProducts(layerConfig);
    totalCount = products.length;
    if(rejected) {
        return
    }

    const productsIDs = products.map(p => p.id());

    const renderablesToRemove = [];
    const renderedRenderables = [];
    layer.renderables.forEach((r => {
        const id = r && r.userProperties && r.userProperties.key;
        renderedRenderables.push(id);
        if(!productsIDs.includes(id)) {
            renderablesToRemove.push(r) ;
        }
    }))

    //remove renderables
    renderablesToRemove.forEach(r => layer.removeRenderable(r));

    //identify new renderables
    const newRenderables = products.filter((p) => {
        const productID = p.id();
        return !renderedRenderables.includes(productID);
    })

    loadedCount = layer.renderables.length;

    for(let productIndex = 0; productIndex < newRenderables.length; productIndex++) {
        const key = newRenderables[productIndex].id();
        const request = newRenderables[productIndex].renderable().then((result) => {
            
            
            if(rejected) {
                return
            }
            const boundaries = getBoundaries(result);

            let uncompleateBoundaries = false;
            if(boundaries && boundaries.length > 0 && boundaries[0].length < 4) {
                uncompleateBoundaries = true;
            }
            const error = result.error instanceof Error;

            if(!error && !uncompleateBoundaries) {
                loadedCount++;
                result['userProperties'] = {
                    key
                }

                layer.addRenderable(result);
                redrawCallback();
                onLayerChanged(changedLayer, {status, loadedCount, totalCount});
            } else {
                //Add also not loaded footprints
                loadedCount++;
                const polygon = productBounds(boundaries);
                polygon['userProperties'] = {
                    key
                }


                layer.addRenderable(polygon);

                errors.push(error);

                redrawCallback();
                // onLayerChanged(changedLayer, {status, loadedCount, totalCount});

            }
        }, (err) => {
            // debugger
        });
        requests.push(request);
    }

    await Promise.all(requests.map(p => p.catch(e => e)));
    onLayerChanged(changedLayer, {status: 'ok', loadedCount, totalCount});

    return msg;
}

export const setFootprintRenderables = async (layer, layerConfig, redrawCallback, onLayerChanged, cancelled) => {
    let rejected = false;
    cancelled.catch(() => {
        rejected = true;
    })
    //return promise
    const msg = {
        status: 'ok',
        loadedCount: null,
        totalCount: null,
    }
    const requests = [];
    const status = 'loading';
    let loadedCount = 0;
    let errors = [];
    let totalCount = 0;
    redrawCallback();
    const changedLayer = {
        satKey: layerConfig.satKey,
        layerKey: layerConfig.layerKey
    }
    onLayerChanged(changedLayer, {status, loadedCount, totalCount})

    const products = await getSciProducts(layerConfig);
    totalCount = products.length;
    if(rejected) {
        return
    }

    const productsIDs = products.map(p => p.id());

    const renderablesToRemove = [];
    const renderedRenderables = [];
    layer.renderables.forEach((r => {
        const id = r && r.userProperties && r.userProperties.key;
        renderedRenderables.push(id);
        if(!productsIDs.includes(id)) {
            renderablesToRemove.push(r) ;
        }
    }))

    //remove renderables
    renderablesToRemove.forEach(r => layer.removeRenderable(r));

    //identify new renderables
    const newRenderables = products.filter((p) => {
        const productID = p.id();
        return !renderedRenderables.includes(productID);
    })

    loadedCount = layer.renderables.length;

    for(let productIndex = 0; productIndex < newRenderables.length; productIndex++) {
        const key = newRenderables[productIndex].id();
        const request = newRenderables[productIndex].renderable().then((result) => {
            
            
            if(rejected) {
                return
            }
            const boundaries = getBoundaries(result);

            let uncompleateBoundaries = false;
            if(boundaries && boundaries.length > 0 && boundaries[0].length < 4) {
                uncompleateBoundaries = true;
            }
            const error = result.error instanceof Error;

            if(!error && !uncompleateBoundaries) {
                loadedCount++;
                result['userProperties'] = {
                    key
                }

                layer.addRenderable(result);
                redrawCallback();
                onLayerChanged(changedLayer, {status, loadedCount, totalCount});
            } else {
                //Add also not loaded footprints
                loadedCount++;
                const polygon = productBounds(boundaries);
                polygon['userProperties'] = {
                    key
                }


                layer.addRenderable(polygon);

                errors.push(error);

                redrawCallback();
                // onLayerChanged(changedLayer, {status, loadedCount, totalCount});

            }
        }, (err) => {
            // debugger
        });
        requests.push(request);
    }

    await Promise.all(requests.map(p => p.catch(e => e)));
    onLayerChanged(changedLayer, {status: 'ok', loadedCount, totalCount});

    return msg;
}

export const reloadLayer = async (layerCfg, wwdLayer, wwd, onLayerChanged) => {

    const layerKey = getLayerKeyFromConfig(layerCfg);
    let rejected = false;
    const activeRequestReject = productsRequests.get(layerKey);
    if(activeRequestReject) {
        //reject pending request
        activeRequestReject();
        rejected = true;
        productsRequests.delete(layerKey);
    }

    const cancelled = new Promise((resolve, reject) => {
        productsRequests.set(layerKey, reject);
    });

    const dispatchChange = (layerKey, change) => {
        if(!rejected) {
            onLayerChanged(layerKey, change);
        }
    }

    try {
        await setRenderables(wwdLayer, layerCfg, wwd.redraw.bind(wwd), dispatchChange, cancelled);
        productsRequests.delete(layerKey);
    } catch (err) {
        if (err.message === "Cancelled") {
            console.log("Connection was closed");
        } else {
            console.log("Unexpected error:", err.stack);
        }
    }
}

export const reloadFootprint = async (layerCfg, wwdLayer, wwd, onLayerChanged) => {

    const layerKey = getLayerKeySCIHubResult(layerCfg.results[0]);
    let rejected = false;
    const activeRequestReject = productsRequests.get(layerKey);
    if(activeRequestReject) {
        //reject pending request
        activeRequestReject();
        rejected = true;
        productsRequests.delete(layerKey);
    }

    const cancelled = new Promise((resolve, reject) => {
        productsRequests.set(layerKey, reject);
    });

    const dispatchChange = (layerKey, change) => {
        if(!rejected) {
            onLayerChanged(layerKey, change);
        }
    }

    try {
        await setRenderablesFromConfig(wwdLayer, layerCfg, wwd.redraw.bind(wwd), dispatchChange, cancelled);
        productsRequests.delete(layerKey);
    } catch (err) {
        if (err.message === "Cancelled") {
            console.log("Connection was closed");
        } else {
            console.log("Unexpected error:", err.stack);
        }
    }
}

export const reloadLayersRenderable = (layers, wwdLayers, wwd, onLayerChanged) => {
    layers.forEach((layerCfg) => {
        //reload only sentinel data
        if(layerCfg.type === 'sentinelData') {
            const layerKey = getLayerKeyFromConfig(layerCfg);
            const wwdLayer = getLayerByName(layerKey, wwdLayers);   
            reloadLayer(layerCfg, wwdLayer, wwd, onLayerChanged);
        }

        if(layerCfg.type === 'sentinelFootprint') {
            const layerKey = getLayerKeySCIHubResult(layerCfg.results[0]);
            const wwdLayer = getLayerByName(layerKey, wwdLayers);   
            reloadFootprint(layerCfg, wwdLayer, wwd, onLayerChanged);
        }
    });
}

export default {
    getLayers,
    getLayerKeyFromConfig,
    getLayerKeySCIHubResult,
    getLayerByName,
    reloadLayersRenderable,
}