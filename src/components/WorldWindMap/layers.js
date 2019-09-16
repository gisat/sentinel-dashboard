import WorldWind from 'webworldwind-esa';
import WordWindX from 'webworldwind-x';
import createCachedSelector from 're-reselect';
import './style.css';
import SatelliteModelLayer from './SatelliteModelLayer';
import OrbitLayer from './OrbitLayer';
import {getModel} from './satellitesModels';
const {
    SentinelCloudlessLayer,
    SciHubProducts,
    EoUtils,
} = WordWindX;
const {
    RenderableLayer,
    Position
} = WorldWind;

const username = 'copapps';
const password = 'C9C-2EZ-gQ4-ezY';
const csiRenderablesCache = new window.Map();
const layersCache = new window.Map();
const productsScihub = new SciHubProducts(csiRenderablesCache, fetchWithCredentials);
const defaultBackgroundLayer = new SentinelCloudlessLayer();

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

const getOrbitLayer = (layerConfig, time = new Date()) => {
    const layerKey = layerConfig.key;
    const cacheLayer = layersCache.get(layerKey);
    if(cacheLayer) {
        if(time !== cacheLayer.time.toString()) {
            cacheLayer.setTime(new Date(time));
        }
        return cacheLayer;
    } else {
        const layer = new OrbitLayer({key: layerKey, satRec: layerConfig.specs, time});
        layersCache.set(layerKey, layer);
        return layer;
    }
}

const getSatelliteLayer = (layerConfig, time, wwd) => {
    const layerKey = layerConfig.key;
    const cacheLayer = layersCache.get(layerKey);
    if(cacheLayer) {
        //upadte time on change
        if(time !== cacheLayer.time) {
            const satrec = EoUtils.computeSatrec(layerConfig.satData.tleLineOne, layerConfig.satData.tleLineTwo);
            const position = EoUtils.getOrbitPosition(satrec, new Date(time));
            cacheLayer.setPosition(new Position(position.latitude, position.longitude, position.altitude));
            cacheLayer.setTime(time);
        }
        return cacheLayer;
    } else {
        const layer = new SatelliteModelLayer({key: layerKey, time: time});
        layer.setRerender(() => wwd.redraw());
        getModel(`${layerConfig.satData.filePath}/${layerConfig.satData.fileName}`, layerKey).then(
            (model) => {
                layer.setModel(model)
                const satrec = EoUtils.computeSatrec(layerConfig.satData.tleLineOne, layerConfig.satData.tleLineTwo);
                const position = EoUtils.getOrbitPosition(satrec, new Date(time));
                layer.setPosition(new Position(position.latitude, position.longitude, position.altitude));
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
], (layersConfig, time, wwd) => {
    const layers = [defaultBackgroundLayer];
    const sentinelDataLayersConfigs = filterSentinelDataLayersConfigs(layersConfig);
    const sentinelLayers = sentinelDataLayersConfigs.map(getSentinelLayer);
    
    const orbitLayersConfigs = filterOrbitLayersConfigs(layersConfig);
    const orbitLayers = orbitLayersConfigs.map((o) => getOrbitLayer(o, time));
    const satellitesLayersConfigs = filterSatelliteLayersConfigs(layersConfig);
    const satelliteLayers = satellitesLayersConfigs.map((s) => getSatelliteLayer(s, time, wwd));
    return [...layers, ...sentinelLayers, ...orbitLayers, ...satelliteLayers];
})((layersConfig, time) => {
    const stringTime = time ? time.toString() : '';
    const sentinelDataLayersConfigs = filterSentinelDataLayersConfigs(layersConfig);
    const orbitLayersConfigs = filterOrbitLayersConfigs(layersConfig);
    const satellitesLayersConfigs = filterSatelliteLayersConfigs(layersConfig);

    const orbitKeys = orbitLayersConfigs.map(l => l.key).join(',');
    const satellitesKeys = satellitesLayersConfigs.map(l => l.key).join(',');
    const activeLayersKeys = sentinelDataLayersConfigs.map((layerConfig) => `${getLayerKeyFromConfig(layerConfig)}-${layerConfig.beginTime.toString()}-${layerConfig.endTime.toString()}`).join(',')
    //invalidate time
    const cacheKey = `${stringTime}-${satellitesKeys}-${orbitKeys}-${activeLayersKeys}`;
    return cacheKey;
});

const getSciProducts = async (layerConfig) => {
    try {
        const productsLocal = productsScihub.products({
            shortName: layerConfig.satKey,
            products: [layerConfig.layerKey],
            beginTime: layerConfig.beginTime,
            endTime: layerConfig.endTime
        })
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