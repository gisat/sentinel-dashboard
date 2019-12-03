import WorldWind from 'webworldwind-esa';

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
    }
}

export default FreeCamera;