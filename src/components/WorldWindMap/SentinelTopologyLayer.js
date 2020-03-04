import WorldWind from 'webworldwind-esa';

const {
    Location,
    Sector,
    WmsLayer
} = WorldWind;

class SentinelTopologyLayer extends WmsLayer {
    constructor(){
        let url = 'https://tiles.maps.eox.at/wms';
        if(window.location.host === 'dashboard.eoapps.eu') {
            url = 'https://tiles.esa.maps.eox.at/wms'
        }

        super({
            service: url,
            layerNames: "overlay",
            title: "Overlay layer by EOX - 4326",
            sector: new Sector(-90, 90, -180, 180),
            levelZeroDelta: new Location(45, 45),
            numLevels: 19,
            format: "image/jpg",
            opacity: 1,
            size: 256,
            version: "1.3.0"
        });
    }
}

export default SentinelTopologyLayer;