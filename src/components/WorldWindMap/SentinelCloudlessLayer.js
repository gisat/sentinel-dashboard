import WorldWind from 'webworldwind-esa';

const {
    Location,
    Sector,
    WmsLayer
} = WorldWind;

class SentinelCloudlessLayer extends WmsLayer {
    constructor(){
        let url = 'https://tiles.maps.eox.at/wms';
        if(window.location.host === 'dashboard.eoapps.eu') {
            url = 'https://tiles.esa.maps.eox.at/wms'
        }

        super({
            service: url,
            layerNames: "s2cloudless-2018",
            title: "Sentinel Cloudless Layer",
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

export default SentinelCloudlessLayer;