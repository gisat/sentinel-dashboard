import EnabledController from './EnabledController';

/*
Test data
The navigator behaves properly. So basically what I need to implement is the possibility to
 */
class EnabledFocusedController extends EnabledController {
    constructor(worldWindow) {
        super(worldWindow);
    }

    handlePanOrDrag(recognizer) {
        if(this._enabled) {
            // This seems to be the key part to change.
            // TODO: Turn around the satellite based on the amount of pixels traveled.

            // I have new sphere with different radisu. I am travelling on the surface of the sphere. I need to be able to
            // map the distance to the space.
            // Maybe work with the percentage. Percentage of the movement compared to the percentage of the area.

            var state = recognizer.state,
                tx = recognizer.translationX,
                ty = recognizer.translationY;

            var navigator = this.wwd.navigator;
            if (state === WorldWind.BEGAN) {
                this.lastPoint.set(0, 0);
            } else if (state === WorldWind.CHANGED) {
                // Convert the translation from screen coordinates to arc degrees. Use this navigator's range as a
                // metric for converting screen pixels to meters, and use the globe's radius for converting from meters
                // to arc degrees.
                const canvas = this.wwd.canvas,
                    globeRadius = 100,
                    distance = WWMath.max(1, navigator.range),
                    metersPerPixel = WWMath.perspectivePixelSize(canvas.clientWidth, canvas.clientHeight, distance),

                    forwardMeters = (ty - this.lastPoint[1]) * metersPerPixel,
                    sideMeters = -(tx - this.lastPoint[0]) * metersPerPixel,

                    forwardDegrees = (forwardMeters / globeRadius) * Angle.RADIANS_TO_DEGREES,
                    sideDegrees = (sideMeters / globeRadius) * Angle.RADIANS_TO_DEGREES;

                // Apply the change in latitude and longitude to this navigator, relative to the current heading.
                const sinHeading = Math.sin(navigator.heading * Angle.DEGREES_TO_RADIANS),
                    cosHeading = Math.cos(navigator.heading * Angle.DEGREES_TO_RADIANS);

                const latitudeChange = forwardDegrees * cosHeading - sideDegrees * sinHeading;
                const longitudeChange = forwardDegrees * sinHeading + sideDegrees * cosHeading;

                const percentageChangeLatitude = latitudeChange / 180;
                const percentageChangeLongitude = longitudeChange / 360;

                // Get the points on the edge of the globe?
                // Basically how do I translate from the spherical space of the satellite to the spherical space of the globe?



                this.applyLimits();
                this.wwd.redraw();

                // Track state for possible fling behaviour
                this.dragDelta.set(
                    this.dragLastLocation.latitude - navigator.lookAtLocation.latitude,
                    Angle.normalizedDegreesLongitude(
                        this.dragLastLocation.longitude - navigator.lookAtLocation.longitude
                    )
                );
                this.dragLastLocation.copy(navigator.lookAtLocation);

                this.lastPoint.set(tx, ty);
            }
        }
    }

    handleSecondaryDrag(recognizer) {
        if(this._enabled) {
            super.handleSecondaryDrag(recognizer);
        }
    }

    handleFling(recognizer) {
        if(this._enabled) {
            // How should it behave
            super.handleFling(recognizer);
        }
    }

    handlePinch(recognizer) {
        if(this._enabled) {
            super.handlePinch(recognizer);
        }
    }

    handleRotation(recognizer) {
        // Do nothing
    }

    handleTilt(recognizer) {
        // Do nothing
    }

    handleWheelEvent(recognizer) {
        // This works properly.
        if(this._enabled) {
            super.handleWheelEvent(recognizer);
        }
    }
}

export default EnabledFocusedController;