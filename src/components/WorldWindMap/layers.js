import WorldWind from 'webworldwind-esa';
import WordWindX from 'webworldwind-x';
import createCachedSelector from 're-reselect';
import './style.css';
import {removeItemByIndex} from '../../utils/arrayManipulation';
const {
    SentinelCloudlessLayer,
    SciHubProducts
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

const productsRequests = [];
export function getLayerKeyFromConfig (layerConfig) {
    return `${layerConfig.satKey}-${layerConfig.layerKey}`;   
}

export function getLayerIdFromConfig (layerConfig) {
    return `${layerConfig.satKey}-${layerConfig.layerKey}-${layerConfig.beginTime.toString()}-${layerConfig.endTime.toString()}`;   
}

export function getLayerByName (name, layers) {
    return layers.find(l => l.displayName === name);
}

function fetchWithCredentials (url, options = {}) {
    if (!options.headers) {
        options.headers = {};
    }
    options.headers.Authorization = `Basic ${window.btoa(`${username}:${password}`)}`;

    const controller = new AbortController();
    const signal = controller.signal;

    options['signal'] = signal;

    const fetch = window.fetch(url, options);
    productsRequests.push(controller);

    fetch.then(() => {
        //remove self from productsRequests
        const fetchIndex = productsRequests.findIndex(r => r === controller);
        removeItemByIndex(productsRequests, fetchIndex);
        
    })

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
export const getLayers = createCachedSelector([
    (layersConfig) => layersConfig,
], (layersConfig) => {
    const layers = [defaultBackgroundLayer];

    const sentinelLayers = layersConfig.map(getSentinelLayer);
    return [...layers, ...sentinelLayers];
})((layersConfig) => {
    return layersConfig.map((layerConfig) => `${getLayerKeyFromConfig(layerConfig)}-${layerConfig.beginTime.toString()}-${layerConfig.endTime.toString()}`).join(',')
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

export const setRenderables = async (layer, layerConfig, redrawCallback, onLayerChanged) => {
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
    for(let productIndex = 0; productIndex < products.length; productIndex++) {
        const request = products[productIndex].renderable().then((result) => {
            const error = result instanceof Error;
            if(!error) {
                loadedCount++;
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

export const reloadLayersRenderable = (layers, wwdLayers, wwd, onLayerChanged) => {

    layers.forEach((layerCfg) => {
        const layerKey = getLayerKeyFromConfig(layerCfg);
        const layer = getLayerByName(layerKey, wwdLayers);   
        //FIXME disable layer, go to future, go to past, enable layer -> not loading
        layer.removeAllRenderables();
        setRenderables(layer, layerCfg, wwd.redraw.bind(wwd), onLayerChanged)
    });
}

export default {
    getLayers,
    getLayerKeyFromConfig,
    getLayerByName,
    reloadLayersRenderable,
}