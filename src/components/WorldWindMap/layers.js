import WorldWind from 'webworldwind-esa';
import WordWindX from 'webworldwind-x';
import './style.css';
const {SciHubProducts} = WordWindX;
const {
    RenderableLayer,
} = WorldWind;

const username = 'copapps';
const password = 'C9C-2EZ-gQ4-ezY';

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
        // beginTime: layerConfig.beginTime,
        // endTime: layerConfig.endTime
        beginTime: new Date("2017-06-01 03:45:32.004+02:00"),
        endTime: new Date("2017-06-01 04:45:32.004+02:00")
    });
    productsLayer.addRenderables(productsLocal);
    return productsLayer;
}

export const getLayers = async (layersConfig) => {
    const layers = [new WorldWind.BMNGLandsatLayer()];

    const layersReq = layersConfig.map(getSentinelLayer);

    return Promise.all(layersReq).then((l) => {
        return [...layers, ...l];
    });
}

export default {
    getLayers,
}