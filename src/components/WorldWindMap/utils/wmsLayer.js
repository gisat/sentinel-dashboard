import WorldWind from 'webworldwind-esa';
const {
        WmsCapabilities,
        WmsLayer
    } = WorldWind;


const getLayerFromCapabilitiesUrl = async (url, layerName) => {
    //get capabilities
    try{
        const capabilities = await fetch(url).then(res => res.text());
        const wmsCapabilities = parseCapabilities(capabilities);
        const wmsLayerCapabilities = wmsCapabilities.getNamedLayer(layerName);
        const wmsConfig = WmsLayer.formLayerConfiguration(wmsLayerCapabilities);
        return wmsConfig;
    } catch (e) {
        console.log('Failed getting WMS capabilities', e);
    }
}

const parseCapabilities = (xml) => {
    const xmlDom = new DOMParser().parseFromString(xml, 'text/xml');
    const wmsCapabilities = new WmsCapabilities(xmlDom);
    return wmsCapabilities;
}

export default {
    getLayerFromCapabilitiesUrl,
    parseCapabilities
}