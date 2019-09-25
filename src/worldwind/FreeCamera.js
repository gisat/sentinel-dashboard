import WorldWind from 'webworldwind-gisat';

const {
    Angle,
    ArcBallCamera,
    WWMath
} = WorldWind;

class FreeCamera extends ArcBallCamera {
    constructor(wwd) {
        super(wwd);

        this._isFixed = false;
    }

    applyLimits() {
        // Clamp latitude to between -90 and +90, and normalize longitude to between -180 and +180.
        this.position.latitude = WWMath.clamp(this.position.latitude, -90, 90);
        this.position.longitude = Angle.normalizedDegreesLongitude(this.position.longitude);

        // Clamp altitude to values greater than 0 in order to prevent looking undergound.
        this.position.altitude = WWMath.clamp(this.position.altitude, 0, Number.MAX_VALUE);

        // Clamp range to values greater than 1 in order to prevent degenerating to a first-person navigator when
        // range is zero.
        this.range = WWMath.clamp(this.range, 1, Number.MAX_VALUE);

        // Normalize heading to between -180 and +180.
        this.heading = Angle.normalizedDegrees(this.heading);

        if(!this._isFixed) {
            // Clamp tilt to between 0 and +90 to prevent the viewer from going upside down.
            this.tilt = WWMath.clamp(this.tilt, 0, 90);
        } else {
            this.tilt = WWMath.clamp(this.tilt, 0, 180);
        }

        // Normalize roll to between -180 and +180.
        this.roll = Angle.normalizedDegrees(this.roll);

        // Apply 2D limits when the globe is 2D.
        if (this.wwd.globe.is2D()) {
            // Clamp range to prevent more than 360 degrees of visible longitude. Assumes a 45 degree horizontal
            // field of view.
            var maxRange = 2 * Math.PI * this.wwd.globe.equatorialRadius;
            this.range = WWMath.clamp(this.range, 1, maxRange);

            // Force tilt to 0 when in 2D mode to keep the viewer looking straight down.
            this.tilt = 0;
        }
    }
}

export default FreeCamera;