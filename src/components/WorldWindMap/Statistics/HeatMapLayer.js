import WorldWind from 'webworldwind-esa';
const {
    HeatMap,
    Sector
} = WorldWind;

/**
 *
 * @constructor
 */
class HeatMapLayer extends HeatMap {
    constructor(displayName, measuredLocations) {
        super(displayName, measuredLocations, 1);

        this.radius = function (sector) {
            if (sector.maxLongitude - sector.minLongitude >= 45) {
                return 25;
            } else if (sector.maxLongitude - sector.minLongitude >= 22.5) {
                return 50;
            } else if (sector.maxLongitude - sector.minLongitude >= 11.125) {
                return 100;
            } else if (sector.maxLongitude - sector.minLongitude >= 5.5) {
                return 200;
            }

            return 400;
        };
        
        this.opacity = 0.8;
    }

    calculateExtendedSector(sector) {
        let extensionFactor;
        if (sector.maxLongitude - sector.minLongitude >= 45) {
            extensionFactor = 0.25;
        } else if (sector.maxLongitude - sector.minLongitude >= 22.5) {
            extensionFactor = 0.5;
        } else if (sector.maxLongitude - sector.minLongitude >= 11.125) {
            extensionFactor = 1;
        } else if (sector.maxLongitude - sector.minLongitude >= 5.5) {
            extensionFactor = 1.5;
        } else {
            extensionFactor = 2;
        }

        let latitudeChange = (sector.maxLatitude - sector.minLatitude) * extensionFactor;
        let longitudeChange = (sector.maxLongitude - sector.minLongitude) * extensionFactor;
        return {
            sector: new Sector(
                sector.minLatitude - latitudeChange,
                sector.maxLatitude + latitudeChange,
                sector.minLongitude - longitudeChange,
                sector.maxLongitude + longitudeChange
            ),
            extensionFactor: extensionFactor
        };
    }
}

export default HeatMapLayer;