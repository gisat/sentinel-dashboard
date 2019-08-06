import WorldWind from 'webworldwind-esa';
import WordWindX from 'webworldwind-x';
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
const defaultBackgroundLayer = new SentinelCloudlessLayer();

const fetchWithCredentials = (url, options = {}) => {
    if (!options.headers) {
        options.headers = {};
    }
    options.headers.Authorization = `Basic ${window.btoa(`${username}:${password}`)}`;

    return window.fetch(url, options);
};

const getSentinelLayer = async (layerConfig) => {
    const cache = new window.Map();
    const productsLayer = new RenderableLayer('Products');

    const productsScihub = new SciHubProducts(cache, fetchWithCredentials);
    const productsLocal = await productsScihub.renderables({
        shortName: layerConfig.satKey,
        products: [layerConfig.layerKey],
        beginTime: layerConfig.beginTime,
        endTime: layerConfig.endTime
    });
    productsLayer.addRenderables(productsLocal);
    return productsLayer;
}

export const getLayers = async (layersConfig) => {
    const layers = [defaultBackgroundLayer];

    const layersReq = layersConfig.map(getSentinelLayer);

    return Promise.all(layersReq).then((l) => {
        return [...layers, ...l];
    });
}

export default {
    getLayers,
}