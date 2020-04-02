import WorldWind from 'webworldwind-esa';

const {
    Sector,
    Location,
} = WorldWind;

const getWmsProductFromONDA = (shape, id, url) => {
    const boundaries = shape._boundaries[0];

    var minLatitude = boundaries[0].latitude;
    var maxLatitude = boundaries[0].latitude;
    var minLongitude = boundaries[0].longitude;
    var maxLongitude = boundaries[0].longitude;
    for (let i = 1; i < boundaries.length; i++) {
        minLatitude = Math.min(minLatitude, boundaries[i].latitude);
        maxLatitude = Math.max(maxLatitude, boundaries[i].latitude);
        minLongitude = Math.min(minLongitude, boundaries[i].longitude);
        maxLongitude = Math.max(maxLongitude, boundaries[i].longitude);
    }

    var shapeSector = new Sector(
        minLatitude,
        maxLatitude,
        minLongitude,
        maxLongitude
    );
    var customLocation = new Location(36, 36);

    const wmsConfigOnda = {
        service: url,
        layerNames: id,
        sector: shapeSector,
        levelZeroDelta: customLocation,
        numLevels: 19,
        format: "image/png",
        size: 256,
        coordinateSystem: "EPSG:4326",
        version: "1.1.1",
    };
     console.log(wmsConfigOnda);
     return wmsConfigOnda;
    // const wmsLayer = new WmsLayer(wmsConfigOnda);
    // wmsLayer.doProxy = false;// true;
    // wmsLayer.maxActiveAltitude = 2500000;
    // return wmsLayer;

}

export default {
    getWmsProductFromONDA,
}