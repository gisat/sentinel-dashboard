import WorldWind from 'webworldwind-esa';

const {
    ShapeAttributes,
    Color,
} = WorldWind;

const addBoundariesAltitude = (boundaries = [], altitude = 0) => {
    return boundaries.map((bs) => {
        if(bs && Array.isArray(bs)) {
            return addBoundariesAltitude(bs, altitude);
        } else {
            return new WorldWind.Position(bs.latitude, bs.longitude, altitude);
        }
    })
}

export const productBounds = (boundaries) => {
    //ideal would be use SurfacePolygon, but because of local WWW updates is layer broken
    const polygon = new WorldWind.Polygon(addBoundariesAltitude(boundaries, 90000), null);
    polygon.altitudeMode = WorldWind.ABSOLUTE;
    polygon.extrude = false; // extrude the polygon edges to the ground

    const polygonAttributes = new WorldWind.ShapeAttributes(null);
    polygonAttributes.drawInterior = true;
    polygonAttributes.drawOutline = true;
    polygonAttributes.outlineColor = WorldWind.Color.BLUE;
    polygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, .2);
    polygonAttributes.drawVerticals = polygon.extrude;
    polygonAttributes.applyLighting = false;
    polygon.attributes = polygonAttributes;
    return polygon;
}

export const productAttributes = () => {
    const shapeAttributes = new ShapeAttributes(null);
    shapeAttributes.drawOutline = true;
    shapeAttributes.drawInterior = false;
    shapeAttributes.outlineColor = new Color(1, 0, 0, 1);
    shapeAttributes.outlineWidth = 1;
    return shapeAttributes;
}
export const getBoundaries = (product) => {
    if(product && product.boundaries) {
        //close polygon by first point
        return product.boundaries;
    } else {
        return [];
    }
}

export const getProductDownloadUrl = (product) => {
    let url;
    for (const prop of product.link) {
        if (prop.rel !== 'icon') {
            url = prop.href;
            break;
        }
    };
    return url;
}