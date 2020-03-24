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
    const polygon = new WorldWind.Polygon(addBoundariesAltitude(boundaries, 100), null);
    polygon.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    polygon.extrude = false; // extrude the polygon edges to the ground

    const polygonAttributes = new WorldWind.ShapeAttributes(null);
    polygonAttributes.drawInterior = false;
    polygonAttributes.drawOutline = true;
    polygonAttributes.outlineColor = WorldWind.Color.BLUE;
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
    return product && product.boundaries;
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