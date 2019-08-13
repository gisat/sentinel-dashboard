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
        return {total:0}
    }
}
export const setRenderables = async (layer, layerConfig, redrawCallback) => {
    const msg = {
        status: 'ok',
        loadedCount: null,
        totalCount: null,
    }
    layer.removeAllRenderables();
    redrawCallback();
    const productsLocal = await getSciRenderables(layerConfig);
    layer.removeAllRenderables();
    if(productsLocal.total === 0) {
        msg.status = 'error'
        msg.message = 'No data found'
    }else {
        layer.addRenderables(productsLocal.renderables);
        msg.loadedCount = productsLocal.renderables.length;
        msg.totalCount = productsLocal.total;
    }

    redrawCallback();
    return msg;
}

export const reloadLayersRenderable = (layers, wwdLayers, wwd, onLayerChanged) => {

    layers.forEach((layerCfg) => {
        const layerKey = getLayerKeyFromConfig(layerCfg);
        const layer = getLayerByName(layerKey, wwdLayers);   

        onLayerChanged(
            {
                satKey: layerCfg.satKey,
                layerKey: layerCfg.layerKey
            }, {
                status: 'loading'
            })


        setRenderables(layer, layerCfg, wwd.redraw.bind(wwd)).then((msg) => {
            wwd.redraw();
            if(msg.status === 'error') {
                onLayerChanged(
                    {
                        satKey: layerCfg.satKey,
                        layerKey: layerCfg.layerKey
                    }, {
                        status: 'error',
                        message: msg.message,
                    })
            } else {
                onLayerChanged(
                    {
                        satKey: layerCfg.satKey,
                        layerKey: layerCfg.layerKey
                    }, 
                    {
                        status: 'ok',
                        loadedCount: msg.loadedCount,
                        totalCount: msg.totalCount,
                    }
                )
            }
        });
    });
}

export default {
    getLayers,
    getLayerKeyFromConfig,
    getLayerByName,
    reloadLayersRenderable,
}