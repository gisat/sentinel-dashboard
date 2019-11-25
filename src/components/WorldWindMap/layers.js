import WorldWind from 'webworldwind-gisat';
import WordWindX from 'webworldwind-x';
import createCachedSelector from 're-reselect';
import './style.css';
import SatelliteModelLayer from './SatelliteModelLayer';
import OrbitLayer from './OrbitLayer';
import AcquisitionPlanLayer from './AcquisitionPlanLayer';
import SwathLayer from './SwathLayer';
import {getPlansKeys} from '../../utils/acquisitionPlans';
import {getModel} from './satellitesModels';
import SciHubProducts from '../../worldwind/products/Products';
import SentinelCloudlessLayer from '../../worldwind/layer/SentinelCloudlessLayer';
const {
    StarFieldLayer,
    EoUtils,
} = WordWindX;
const {
    RenderableLayer,
} = WorldWind;

const username = 'copapps';
const password = 'C9C-2EZ-gQ4-ezY';
const csiRenderablesCache = new window.Map();
const layersCache = new window.Map();
const productsScihub = new SciHubProducts(csiRenderablesCache, fetchWithCredentials);
const defaultBackgroundLayer = new SentinelCloudlessLayer();
const defaultStarfieldLayer = new StarFieldLayer();

const productsRequests = new window.Map();
export function getLayerKeyFromConfig (layerConfig) {
    return `${layerConfig.satKey}-${layerConfig.layerKey}`;   
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
    options.headers.Authorization = `Basic ${window.btoa(`${username}:${password}`)}`;

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

        if(time !== cacheLayer.time) {
            cacheLayer.setTime(time);
        }
        return cacheLayer;
    } else {
        const layer = new AcquisitionPlanLayer({key: layerKey, satName: layerConfig.satName, time: time, onLayerChanged});
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
], (layersConfig, time, wwd, onLayerChanged, currentTime) => {
    const layers = [defaultStarfieldLayer, defaultBackgroundLayer];
    const sentinelDataLayersConfigs = filterSentinelDataLayersConfigs(layersConfig);
    const sentinelLayers = sentinelDataLayersConfigs.map(getSentinelLayer);
    
    const orbitLayersConfigs = filterOrbitLayersConfigs(layersConfig);
    const orbitLayers = orbitLayersConfigs.map((o) => getOrbitLayer(o, time, wwd, currentTime));
    const satellitesLayersConfigs = filterSatelliteLayersConfigs(layersConfig);
    const satelliteLayers = satellitesLayersConfigs.map((s) => getSatelliteLayer(s, time, wwd));
    const acquisitionPlanLayersConfigs = filterAcquisitionPlanLayersConfigs(layersConfig);
    const acquisitionPlanLayers = acquisitionPlanLayersConfigs.map((s) => getAcquisitionPlanLayer(s, wwd, time, onLayerChanged));
    const swathLayers = acquisitionPlanLayersConfigs.map((s) => getSwathLayer(s, wwd, time));
    return [...layers, ...sentinelLayers, ...orbitLayers, ...satelliteLayers, ...acquisitionPlanLayers, ...swathLayers];
})((layersConfig, time, wwd, onLayerChanged, currentTime) => {
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
    const cacheKey = `${stringTime}-${stringCurrentTime}-${satellitesKeys}-${orbitKeys}-${activeLayersKeys}-${acquisitionPlanLayersKeys}`;
    return cacheKey;
});

const getSciProducts = async (layerConfig) => {
    try {
        let beginTime = layerConfig.beginTime;
        let endTime = layerConfig.endTime;
        if(layerConfig.satData.shortName === 'S-2A' ||
            layerConfig.satData.shortName === 'S-2B') {
            beginTime = new Date(layerConfig.beginTime.getTime() + (15 * 60 * 1000));
            endTime = new Date(layerConfig.endTime.getTime() - (15 * 60 * 1000));
        }

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

    for(let productIndex = 0; productIndex < products.length; productIndex++) {
        const key = products[productIndex].id();
        const request = products[productIndex].renderable().then((result) => {
            if(rejected) {
                return
            }
            if(result.boundaries && result.boundaries.length > 0 && result.boundaries[0].length < 4) {
                return;
            }

            const error = result instanceof Error;
            if(!error) {
                loadedCount++;
                result['userProperties'] = {
                    key
                }
                layer.addRenderable(result);
                redrawCallback();
                onLayerChanged(changedLayer, {status, loadedCount, totalCount});
            } else {
                errors.push(error);
            }
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

    wwdLayer.removeAllRenderables();
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

export const reloadLayersRenderable = (layers, wwdLayers, wwd, onLayerChanged) => {
    layers.forEach((layerCfg) => {
        //reload only sentinel data
        if(layerCfg.type === 'sentinelData') {
            const layerKey = getLayerKeyFromConfig(layerCfg);
            const wwdLayer = getLayerByName(layerKey, wwdLayers);   
            reloadLayer(layerCfg, wwdLayer, wwd, onLayerChanged);
        }
    });
}

export default {
    getLayers,
    getLayerKeyFromConfig,
    getLayerByName,
    reloadLayersRenderable,
}