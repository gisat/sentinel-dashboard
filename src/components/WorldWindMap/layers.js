import WorldWind from 'webworldwind-esa';
import WordWindX from 'webworldwind-x';
import createCachedSelector from 're-reselect';
import './style.css';
import SatelliteModelLayer from './SatelliteModelLayer';
import OrbitLayer from './OrbitLayer';
import SentinelCloudlessLayer from './SentinelCloudlessLayer';
import SentinelTopologyLayer from './SentinelTopologyLayer';
import AcquisitionPlanLayer from './AcquisitionPlanLayer';
import StatisticsLayer from './Statistics/StatisticsLayer';
import MultiRangeLayer from './MultiRangeLayer';
import FootPrintLayer from './FootPrintLayer';
import SwathLayer from './SwathLayer';
import {getPlansKeys} from '../../utils/acquisitionPlans';
import {getBoundaries, productBounds} from '../../utils/product';
import {getModel} from './satellitesModels';
import SciHubProducts, {productIntersectTime} from '../../worldwind/products/Products';
import {hubPassword, hubUsername} from "../../config";
import { getSwathKey, getColorForSatType } from '../../utils/swath';

window.WorldWind.configuration.baseUrl = `${window.location.origin}${window.location.pathname}`;
console.log("WorldWind.configuration.baseUrl set to: ", window.WorldWind.configuration.baseUrl);

const {
    StarFieldLayer,
    EoUtils,
} = WordWindX;

const {
    RenderableLayer,
    AtmosphereLayer,
} = WorldWind;

const csiRenderablesCache = new window.Map();
const searchCache = new window.Map();
const layersCache = new window.Map();
const productsScihub = new SciHubProducts(csiRenderablesCache, searchCache, fetchWithCredentials);
const defaultBackgroundLayer = new SentinelCloudlessLayer();
const defaultStarfieldLayer = new StarFieldLayer('./images/stars.json');
const defaultAtmosphereLayer = new AtmosphereLayer('./images/dnb_land_ocean_ice_2012.png');

const MINVISIBLERANGE = 1000000;
const MAXVISIBLERANGE = 100000000000;

const multiRangeAtmosphereLayer = new MultiRangeLayer('multiRangeAtmosphereLayer', {
    key: 'multiRangeAtmosphereLayer',
    layers: [{
        layer:defaultAtmosphereLayer,
        rangeInterval: [MINVISIBLERANGE,MAXVISIBLERANGE]
    }]
});
const productsRequests = new window.Map();
const defaultTopologyLayer = new SentinelTopologyLayer();
const multiRangeTopologyLayer = new MultiRangeLayer('multiRangeTopologyLayer', {
    key: 'multiRangeTopologyLayer',
    layers: [{
        layer:defaultTopologyLayer,
        rangeInterval: [MINVISIBLERANGE,MAXVISIBLERANGE]
    }]
});


export function getLayerKeySCIHubResult (layerConfig) {
    return `${layerConfig.id._text}`;
}

export function getLayerKeyFromConfig (layerConfig) {
    //identify search layer
    if(layerConfig && layerConfig.results && layerConfig.results[0] && layerConfig.results[0].id && layerConfig.results[0].id._text) {
        return getLayerKeySCIHubResult(layerConfig.results[0]);
    } else if(layerConfig.satKey && layerConfig.layerKey) {
        return `${layerConfig.satKey}-${layerConfig.layerKey}`;   
    } else {
        return `${layerConfig.type}-${layerConfig.key}`;
    }
}

export function getLayerIdFromConfig (layerConfig) {
    if(layerConfig.satKey && layerConfig.layerKey && layerConfig.beginTime && layerConfig.endTime) {
        return `${layerConfig.satKey}-${layerConfig.layerKey}-${layerConfig.beginTime.toString()}-${layerConfig.endTime.toString()}`;   
    } else if(layerConfig && layerConfig.results && layerConfig.results[0] && layerConfig.results[0].id && layerConfig.results[0].id._text) {
        return getLayerKeySCIHubResult(layerConfig.results[0]);
    }else {
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

const filterStatisticsLayersConfigs = (layersConfig) => {
    return layersConfig.filter(l => l.type === 'statistics');
}

const filterSwathLayersConfigs = (layersConfig) => {
    return layersConfig.filter(l => l.type === 'swath');
}

const filterSatelliteLayersConfigs = (layersConfig) => {
    return layersConfig.filter(l => l.type === 'satellite');
}

const filterSentinelDataLayersConfigs = (layersConfig) => {
    return layersConfig.filter(l => l.type === 'sentinelData');
}

const filterSearchLayersConfigs = (layersConfig) => {
    return layersConfig.filter(l => l.type === 'sentinelFootprint');
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
    const layerKey = getLayerKeySCIHubResult(layerConfig.results[0]);
    const cacheLayer = layersCache.get(layerKey);
    
    if(cacheLayer) {
        return cacheLayer;
    } else {
        const layer = new FootPrintLayer(layerKey);
        layersCache.set(layerKey, layer);
        return layer;
    }
}

const getOrbitLayer = (layerConfig, time = new Date(), wwd, currentTime) => {
    const layerKey = layerConfig.key;
    const cacheLayer = layersCache.get(layerKey);

    //set specs

    if(cacheLayer) {
        let changed = false;
        if(time.toString() !== cacheLayer.selectTime.toString() || currentTime.toString() !== cacheLayer.currentTime.toString()) {
            changed = true;
            cacheLayer.setTime(new Date(currentTime), new Date(time), true);
        }

        if(layerConfig.specs[0] !== (cacheLayer.satRec && cacheLayer.satRec[0]) || layerConfig.specs[1] !== (cacheLayer.satRec && cacheLayer.satRec[1])) {
            changed = true;
            cacheLayer.setSatRec(layerConfig.specs, true);
        }

        if(changed) {
            cacheLayer.forceUpdate();
        }
        return cacheLayer;
    } else {
        const layer = new OrbitLayer({key: layerKey, satRec: layerConfig.specs, time, currentTime, opacity: 0.7});
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

const getStatisticsLayer = (layerConfig, wwd, time, onLayerChanged) => {
    const layerKey = layerConfig.key;
    const cacheLayer = layersCache.get(layerKey);
    const plans = layerConfig.plans;

    if(cacheLayer) {
        const plansKeys = getPlansKeys(plans);
        const cacheLayerPlansKeys = getPlansKeys(cacheLayer.plans);

        if(time.getTime() !== cacheLayer.time.getTime()) {
            cacheLayer.setTime(time);
        }
        return cacheLayer;
    } else {
        const layer = new StatisticsLayer({key: layerKey, satName: layerConfig.satName, time: time, onLayerChanged, sensornames: layerConfig.sensornames});
        layer.setTime(time);
        layer.setRerender(() => wwd.redraw());
        layersCache.set(layerKey, layer);
        return layer;
    }
}

const getSwathLayer = (layerConfig, wwd, time) => {
    const layerKey = layerConfig.key;
    
    const cacheLayer = layersCache.get(layerKey);

    // const plans = layerConfig.plans;

    if(cacheLayer) {
        //if changed TLE in config
        if((layerConfig.tle && layerConfig.tle[0]) !== (cacheLayer.Tle && cacheLayer.Tle[0]) || (layerConfig.tle && layerConfig.tle[1]) !== (cacheLayer.Tle && cacheLayer.Tle[1])) {
            cacheLayer.setTle(layerConfig.tle);
        }

            if(time.toString() !== cacheLayer.time.toString()) {
                cacheLayer.setTime(time);
            }
            const layerAcquisitionKey = layerConfig.apsKey;
            const sentinelLayerKey = layerConfig.sentinelLayerKey;
            //check if in future
            if(layerAcquisitionKey) {
                const cacheLayerAcquisition = layersCache.get(layerAcquisitionKey);
                const swath = cacheLayerAcquisition.getFootprints(0);
                swath.then(data => {
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
            //check if in past over some data, between start and stop date
            } else if(sentinelLayerKey){
                const sentinelLayer = layersCache.get(`${layerConfig.satName}-${layerConfig.sentinelLayerKey}`)
                const renderables = sentinelLayer.renderables;
                if(renderables) {
                    //check renderables intersect select time
                    const products = renderables.map((r) => getProductByKey(r.userProperties.key));
                    const intersectedProduct = products.find((p) => productIntersectTime(p, time))
                    if(intersectedProduct) {
                        const type = intersectedProduct.metadata().str.sensoroperationalmode;
                        const color = getColorForSatType(layerConfig.satName, type); //get color by type
                        cacheLayer.setType(type);
                        cacheLayer.setColor(color);
                        cacheLayer.setVisible(true);
                    } else {
                        cacheLayer.setVisible(false);
                    }
                } else {
                    cacheLayer.setVisible(false);
                }
            } else {
                cacheLayer.setVisible(false);
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

//call on add product renderable
export const getLayers = createCachedSelector([
    (layersConfig) => layersConfig,
    (layersConfig, time) => time,
    (layersConfig, time, wwd) => wwd,
    (layersConfig, time, wwd, onLayerChanged) => onLayerChanged,
    (layersConfig, time, wwd, onLayerChanged, currentTime) => currentTime,
], (layersConfig, time, wwd, onLayerChanged, currentTime) => {
    defaultStarfieldLayer.time = time;
    defaultAtmosphereLayer.time = time;
    const layers = [
        defaultStarfieldLayer,
        defaultBackgroundLayer,
        multiRangeAtmosphereLayer,
        multiRangeTopologyLayer
    ];

    const sentinelDataLayersConfigs = filterSentinelDataLayersConfigs(layersConfig);
    const sentinelLayers = sentinelDataLayersConfigs.map(getSentinelLayer);
    
    const orbitLayersConfigs = filterOrbitLayersConfigs(layersConfig);
    const orbitLayers = orbitLayersConfigs.map((o) => getOrbitLayer(o, time, wwd, currentTime));

    const satellitesLayersConfigs = filterSatelliteLayersConfigs(layersConfig);
    const satelliteLayers = satellitesLayersConfigs.map((s) => getSatelliteLayer(s, time, wwd));
    
    const acquisitionPlanLayersConfigs = filterAcquisitionPlanLayersConfigs(layersConfig);
    const acquisitionPlanLayers = acquisitionPlanLayersConfigs.map((s) => getAcquisitionPlanLayer(s, wwd, time, onLayerChanged));
    
    const staticticsLayersConfigs = filterStatisticsLayersConfigs(layersConfig);
    const statisticsLayers = staticticsLayersConfigs.map((s) => getStatisticsLayer(s, wwd, time, onLayerChanged));
    
    const swathLayersConfigs = filterSwathLayersConfigs(layersConfig);
    const swathLayers = swathLayersConfigs.map((s) => getSwathLayer(s, wwd, time));
    
    const searchLayerConfigs = filterSearchLayersConfigs(layersConfig);
    const searchLayer = searchLayerConfigs.map((searchResult) => getFootprintLayer(searchResult));

    return [...layers, ...searchLayer, ...sentinelLayers, ...orbitLayers, ...satelliteLayers, ...acquisitionPlanLayers, ...statisticsLayers, ...swathLayers];
})((layersConfig, time, wwd, onLayerChanged, currentTime) => {
    const stringTime = time ? time.toString() : '';
    const stringCurrentTime = currentTime ? currentTime.toString() : '';
    const sentinelDataLayersConfigs = filterSentinelDataLayersConfigs(layersConfig);
    const orbitLayersConfigs = filterOrbitLayersConfigs(layersConfig);
    const satellitesLayersConfigs = filterSatelliteLayersConfigs(layersConfig);

    const acquisitionPlanLayers = filterAcquisitionPlanLayersConfigs(layersConfig);

    const swathLayersConfigs = filterSwathLayersConfigs(layersConfig);
    
    const staticticsLayersConfigs = filterStatisticsLayersConfigs(layersConfig);

    const orbitKeys = orbitLayersConfigs.map(l => l.key).join(',');
    
    const satellitesKeys = satellitesLayersConfigs.map(l => l.key).join(',');
    
    const activeLayersKeys = sentinelDataLayersConfigs.map((layerConfig) => `${getLayerKeyFromConfig(layerConfig)}-${layerConfig.beginTime.toString()}-${layerConfig.endTime.toString()}`).join(',');

    const acquisitionPlanLayersKeys = acquisitionPlanLayers.map((aps) => `${aps.key}_${getPlansKeys(aps.plans)}`);
    
    const swathLayersKeys = swathLayersConfigs.map((swathCfg) => `${getSwathKey(swathCfg)}`).join(',');

    const statisticsLayersKeys = staticticsLayersConfigs.map(l => l.key).join(',');
    
    const searchLayerConfigs = filterSearchLayersConfigs(layersConfig);
    const searchLayerKey = searchLayerConfigs.map((layerConfig) => getLayerKeySCIHubResult(layerConfig.results[0]));

    const cacheKey = `${searchLayerKey}-${stringTime}-${stringCurrentTime}-${satellitesKeys}-${orbitKeys}-${activeLayersKeys}-${acquisitionPlanLayersKeys}-${swathLayersKeys}-${statisticsLayersKeys}`;
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

export const getSciProductByKey = async (productKey) => {
    try {
        const product = productsScihub.loadProduct(productKey);
        return await product;
    } catch {
        console.error('Can not get products.')
    }
}

export const loadLatestProducts = async (shortName, products, location, beginTime, endTime, startIndex) => {
    const feed = await productsScihub.load({shortName, products, location, beginTime, endTime, startIndex});
    if(feed.entry && feed.entry.length > 0) {
        return feed.entry
    } else {
        return null
    }
};

export const setRenderablesFromConfig = async (layer, layerConfig, redrawCallback, onLayerChanged, cancelled, onRenderableAdd) => {
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
                onRenderableAdd(result);
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

export const setRenderables = async (layer, layerConfig, redrawCallback, onLayerChanged, cancelled, onRenderableAdd) => {
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

    // Performance hack how identify if getSciProducts really load data
    // prevent unneceresy mutating state
    let startLoading = true;
    window.setTimeout(() => {
        if(startLoading) {
            onLayerChanged(changedLayer, {status, loadedCount, totalCount})
        }
    }, 50)

    const products = await getSciProducts(layerConfig);
    startLoading = false;
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
                onRenderableAdd(result);
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

export const reloadLayer = async (layerCfg, wwdLayer, wwd, onLayerChanged, onRenderableAdd) => {

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
        await setRenderables(wwdLayer, layerCfg, wwd.redraw.bind(wwd), dispatchChange, cancelled, onRenderableAdd);
        productsRequests.delete(layerKey);
    } catch (err) {
        if (err.message === "Cancelled") {
            console.log("Connection was closed");
        } else {
            console.log("Unexpected error:", err.stack);
        }
    }
}

export const reloadFootprint = async (layerCfg, wwdLayer, wwd, onLayerChanged, onRenderableAdd) => {

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
        await setRenderablesFromConfig(wwdLayer, layerCfg, wwd.redraw.bind(wwd), dispatchChange, cancelled, onRenderableAdd);
        productsRequests.delete(layerKey);
    } catch (err) {
        if (err.message === "Cancelled") {
            console.log("Connection was closed");
        } else {
            console.log("Unexpected error:", err.stack);
        }
    }
}

export const reloadLayersRenderable = (layers, wwdLayers, wwd, onLayerChanged, onRenderableAdd) => {
    layers.forEach((layerCfg) => {
        //reload only sentinel data
        if(layerCfg.type === 'sentinelData') {
            const layerKey = getLayerKeyFromConfig(layerCfg);
            const wwdLayer = getLayerByName(layerKey, wwdLayers);   
            //split animation frame
            window.setTimeout(() => reloadLayer(layerCfg, wwdLayer, wwd, onLayerChanged, onRenderableAdd), 0);
            // reloadLayer(layerCfg, wwdLayer, wwd, onLayerChanged);
        }

        if(layerCfg.type === 'sentinelFootprint') {
            const layerKey = getLayerKeySCIHubResult(layerCfg.results[0]);
            const wwdLayer = getLayerByName(layerKey, wwdLayers);   
            reloadFootprint(layerCfg, wwdLayer, wwd, onLayerChanged, onRenderableAdd);
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