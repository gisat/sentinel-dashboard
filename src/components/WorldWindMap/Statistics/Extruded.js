import WorldWind from 'webworldwind-esa';
const {
    TiledImageLayer,
    Sector,
    Location,
    TriangleMesh,
    WWUtil,
    ShapeAttributes,
    Position
} = WorldWind;

/**
 * It should display hexagonal and partially transparent.
 * @param options {Object}
 * @param options.products {Object[]} Collection of products.
 * @param options.name {String} Name of the layer.
 * @param options.max {Number} Maximum amount of products. In this case we should use it as 100%. Based on this we will
 *  adapt the extruded polygons.
 * @constructor
 */
class Extruded extends TiledImageLayer {
    constructor(options) {
        super(new Sector(-90, 90, -180, 180), new Location(22.5 / 2, 22.5 / 2), 12, 'image/png', 'Extruded' + WWUtil.guid(), 256, 256);

        let data = {};
        let lat, lon;
        for (lat = -90; lat <= 90; lat++) {
            data[lat] = {};
            for (lon = -180; lon <= 180; lon++) {
                data[lat][lon] = [];
            }
        }

        let latitude, longitude;
        options.products.forEach(function (product) {
            latitude = Math.floor(product.latitude);
            longitude = Math.floor(product.longitude);
            data[latitude][longitude].push(product);
        });
        this._data = data;

        this.polygons = {};

        let result = document.createElement('canvas');
        result.height = 256;
        result.width = 256;
        
        let ctx = result.getContext('2d');
        ctx.globalAlpha = 0;
        ctx.fillRect(0,0,256,256);
        ctx.globalAlpha = 1.0;

        this.transparentImage = result;

        this.imagery = null;
    }

    filterGeographically(data, sector) {
        let minLatitude = Math.floor(sector.minLatitude);
        let maxLatitude = Math.floor(sector.maxLatitude);
        let minLongitude = Math.floor(sector.minLongitude);
        let maxLongitude = Math.floor(sector.maxLongitude);

        if (minLatitude <= -90) {
            minLatitude = -90;
        }
        if (maxLatitude >= 90) {
            maxLatitude = 90;
        }

        if (minLongitude <= -180) {
            minLongitude = -180;
        }
        if (maxLongitude >= 180) {
            maxLongitude = 180;
        }

        let aggregatedMissions = {};
        let lat, lon;
        for (lat = minLatitude; lat <= maxLatitude; lat++) {
            for (lon = minLongitude; lon <= maxLongitude; lon++) {
                data[lat][lon].forEach(function (product) {
                    if (sector.containsLocation(product.latitude, product.longitude)) {
                        if(!aggregatedMissions[product.mission.mission]){
                            aggregatedMissions[product.mission.mission] = {
                                amount: 0,
                                color: product.mission.color
                            };
                        }

                        aggregatedMissions[product.mission.mission].amount += product.amount;
                    }
                });
            }
        }

        return aggregatedMissions;
    }

    assemblePolygonsForTile(tile){
        let dataForDrawingPolygons = this.filterGeographically(this._data, tile.sector);
        let missions = Object.keys(dataForDrawingPolygons); // Missions to draw.

        let currentAltitude = 0;

        let extentSizeLatitude = (tile.sector.maxLatitude - tile.sector.minLatitude) / 5;
        let extentSizeLongitude = (tile.sector.maxLongitude - tile.sector.minLongitude) / 5;

        missions.sort();
        let results = [];
        missions.forEach((mission) => {
            let normalizedAmount = Math.sqrt(dataForDrawingPolygons[mission].amount) * 20000;
            let shapeAttributes = new ShapeAttributes();
            let interiorColor = dataForDrawingPolygons[mission].color.clone();
            interiorColor.alpha = 0.6;
            shapeAttributes.interiorColor = interiorColor;
            shapeAttributes.outlineColor = dataForDrawingPolygons[mission].color;
            shapeAttributes.drawInterior = true;
            shapeAttributes.drawOutline = true;
            // How do I make outlines?

            let center1 = new Position(tile.sector.minLatitude + (2.5 * extentSizeLatitude), tile.sector.minLongitude + (2.5 * extentSizeLongitude), currentAltitude),
                a1 = new Position(tile.sector.minLatitude + (3 * extentSizeLatitude), tile.sector.minLongitude + (2.33 * extentSizeLongitude), currentAltitude),
                b1 = new Position(tile.sector.minLatitude + (3 * extentSizeLatitude), tile.sector.minLongitude + (2.66 * extentSizeLongitude), currentAltitude),
                c1 = new Position(tile.sector.minLatitude + (2.66 * extentSizeLatitude), tile.sector.minLongitude + (3 * extentSizeLongitude), currentAltitude),
                d1 = new Position(tile.sector.minLatitude + (2.33 * extentSizeLatitude), tile.sector.minLongitude + (3 * extentSizeLongitude), currentAltitude),
                e1 = new Position(tile.sector.minLatitude + (2 * extentSizeLatitude), tile.sector.minLongitude + (2.66 * extentSizeLongitude), currentAltitude),
                f1 = new Position(tile.sector.minLatitude + (2 * extentSizeLatitude), tile.sector.minLongitude + (2.33 * extentSizeLongitude), currentAltitude),
                g1 = new Position(tile.sector.minLatitude + (2.33 * extentSizeLatitude), tile.sector.minLongitude + (2 * extentSizeLongitude), currentAltitude),
                h1 = new Position(tile.sector.minLatitude + (2.66 * extentSizeLatitude), tile.sector.minLongitude + (2 * extentSizeLongitude), currentAltitude),

                center2 = new Position(tile.sector.minLatitude + (2.5 * extentSizeLatitude), tile.sector.minLongitude + (2.5 * extentSizeLongitude), currentAltitude + normalizedAmount),
                a2 = new Position(tile.sector.minLatitude + (3 * extentSizeLatitude), tile.sector.minLongitude + (2.33 * extentSizeLongitude), currentAltitude + normalizedAmount),
                b2 = new Position(tile.sector.minLatitude + (3 * extentSizeLatitude), tile.sector.minLongitude + (2.66 * extentSizeLongitude), currentAltitude + normalizedAmount),
                c2 = new Position(tile.sector.minLatitude + (2.66 * extentSizeLatitude), tile.sector.minLongitude + (3 * extentSizeLongitude), currentAltitude + normalizedAmount),
                d2 = new Position(tile.sector.minLatitude + (2.33 * extentSizeLatitude), tile.sector.minLongitude + (3 * extentSizeLongitude), currentAltitude + normalizedAmount),
                e2 = new Position(tile.sector.minLatitude + (2 * extentSizeLatitude), tile.sector.minLongitude + (2.66 * extentSizeLongitude), currentAltitude + normalizedAmount),
                f2 = new Position(tile.sector.minLatitude + (2 * extentSizeLatitude), tile.sector.minLongitude + (2.33 * extentSizeLongitude), currentAltitude + normalizedAmount),
                g2 = new Position(tile.sector.minLatitude + (2.33 * extentSizeLatitude), tile.sector.minLongitude + (2 * extentSizeLongitude), currentAltitude + normalizedAmount),
                h2 = new Position(tile.sector.minLatitude + (2.66 * extentSizeLatitude), tile.sector.minLongitude + (2 * extentSizeLongitude), currentAltitude + normalizedAmount);

            // Create Triangle Mesh instead of the polygon.
            let vertices = [
                center2, a2, b2, c2, d2, e2, f2, g2, h2,
                center1, a1, b1, c1, d1, e1, f1, g1, h1
            ];
            let indices = [
                0, 1, 2,
                0, 2, 3,
                0, 3, 4,
                0, 4, 5,
                0, 5, 6,
                0, 6, 7,
                0, 7, 8,
                0, 8, 1,

                9, 10, 11,
                9, 11, 12,
                9, 12, 13,
                9, 13, 14,
                9, 14, 15,
                9, 15, 16,
                9, 16, 17,
                9, 17, 10,

                2, 1, 10,
                2, 10, 11,

                3, 2, 11,
                3, 11, 12,

                4, 3, 12,
                4, 12, 13,

                5, 4, 13,
                5, 13, 14,

                6, 5, 14,
                6, 14, 15,

                7, 6, 15,
                7, 15, 16,

                8, 7, 16,
                8, 16, 17,

                1, 8, 17,
                1, 17, 10
            ];
            let mesh = new TriangleMesh(vertices, indices, shapeAttributes);
            mesh.outlineIndices = [
                1, 2, 11, 10, 11,
                2, 3, 12, 11, 12,
                3, 4, 13, 12, 13,
                4, 5, 14, 13, 14,
                5, 6, 15, 14, 15,
                6, 7, 16, 15, 16,
                7, 8, 17, 16, 17,
                10, 1, 8
            ];

            currentAltitude += normalizedAmount;
            results.push(mesh);
        });

        return results;
    }

    /**
     * In this case instead of actually drawing imagery it renders the polygons associated with relevant tiles.
     * @param dc {DrawContext}
     * @param tile {Tile} Tile to be generated.
     */
    retrieveTileImage(dc, tile) {
        if(!this.polygons[tile.imagePath]) {
            this.polygons[tile.imagePath] = this.assemblePolygonsForTile(tile);
        }

        let imagePath = tile.imagePath;
        let cache = dc.gpuResourceCache;
        let layer = this;

        let texture = layer.createTexture(dc, tile, this.transparentImage);
        layer.removeFromCurrentRetrievals(imagePath);

        if (texture) {
            cache.putResource(imagePath, texture, texture.size);

            layer.currentTilesInvalid = true;
            layer.absentResourceList.unmarkResourceAbsent(imagePath);
        }
    }
}

export default Extruded;