import WorldWind from 'webworldwind-esa';
import WordWindX from 'webworldwind-x';
import createCachedSelector from 're-reselect';
import './style.css';
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

export function getLayerKeyFromConfig (layerConfig) {
    return `${layerConfig.satKey}-${layerConfig.layerKey}`;   
}

export function getLayerByName (name, layers) {
    return layers.find(l => l.displayName === name);
}

function fetchWithCredentials (url, options = {}) {
    if (!options.headers) {
        options.headers = {};
    }
    options.headers.Authorization = `Basic ${window.btoa(`${username}:${password}`)}`;

    return window.fetch(url, options);
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

const getSciRenderables = async (layerConfig) => {

    try{
        const productsLocal = await productsScihub.renderables({
            shortName: layerConfig.satKey,
            products: [layerConfig.layerKey],
            beginTime: layerConfig.beginTime,
            endTime: layerConfig.endTime
        });
        return productsLocal;
    } catch(e) {
        console.error('Can not get renderables.')
        return []
    }
}
export const setRenderables = async (layer, layerConfig, redrawCallback) => {
    const msg = {
        status: 'ok'
    }
    layer.removeAllRenderables();
    const productsLocal = await getSciRenderables(layerConfig);

    if(productsLocal.total === 0) {
        msg.status = 'error'
        msg.message = 'No data found'
    }else {
        layer.addRenderables(productsLocal.renderables);
    }

    redrawCallback();
    return msg;
}

export default {
    getLayers,
    getLayerKeyFromConfig,
    getLayerByName,
}