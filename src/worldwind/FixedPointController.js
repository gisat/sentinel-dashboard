import WorldWind from 'webworldwind-esa';
import TWEEN from '@tweenjs/tween.js';
const {
    BEGAN,
    CHANGED,
    Vec2,
    WWMath,
    Angle,
    Matrix,
    Vec3
} = WorldWind;

/**
 * Alternative controller for World wind, which controls the globe via user interaction as if the user was moving around
 * a different center of the view then the center of the globe.
 * Using wheel of the mouse moves the user nearer and further away from the chosen point.
 * Using the mouse to move in the x and y moves the camera on the surface of the sphere. After this movement is applied,
 *   all the other attributes of the camera are updated so that the camera points in the center of the controller.
 * @param worldWindow {WorldWindow} WorldWindow this controller is associated with.
 * @param point {Position} The Point which serves as the center of the controller.
 * @constructor
 */
class FixedPointController  {
    constructor(worldWindow) {
        /**
         * WorldWindow associated with the current Controller. There is 1:1 relationship between controller and
         * WorldWindow
         * @type {WorldWindow}
         */
        this.worldWindow = worldWindow;

        /**
         * Internal representation of current location of the viewer.
         * @type {Object}
         */
        this.lookAt = this.worldWindow.navigator;

        /**
         * Object containing different types of recognizers. This is basically stored for the preparation of the
         * deconstruction of the Controller.
         * @type {Object}
         */
        this.recognizers = {};

        /**
         * It contains starting point of the users interaction with the globe.
         * @type {Vec2}
         */
        this.lastPoint = new Vec2(0, 0);

        /**
         * It contains starting range for the case when user starts pinch gesture.
         * @type {Number}
         */
        this.beginRange = 0;

        this.sign = 1;

        this.animate = this.animate.bind(this);
        this.animationId = null;
        this.isAnimating = false;
        this.lastDegrees = new Vec2(0, 0);
        this.preventContinuousInnertial = false;

        // Intentionally not documented.
        this.beginPoint = new Vec2(0, 0);
        this.lastPoint = new Vec2(0, 0);
        this.beginHeading = 0;
        this.beginTilt = 0;
        this.lastRotation = 0;
        this.touchStart = 0;
        this.startTimestamp = 0;
        this.panEnd = 0;
        this.touchStartPosition = [-1, -1];
        this.touchEndPosition = [-1, -1];
    }

    get navigator() {
        return this.worldWindow.navigator;
    }

    get globe() {
        return this.worldWindow.globe;
    }

    handlePanOrDrag(recognizer) {
        if (this.worldWindow.globe.is2D()) {
            // this.handlePanOrDrag2D(recognizer);
        } else {
            this.handlePanOrDrag3D(recognizer);
        }
    }

    handlePanOrDrag3D(recognizer) {
        var state = recognizer.state,
            tx = recognizer.translationX,
            ty = recognizer.translationY;

        if (state === WorldWind.BEGAN) {
            this.lastPoint.set(0, 0);
            this.startTimestamp = Date.now();

            this.stopAnimation();
        }
        else if (state === WorldWind.CHANGED) {
            // Convert the translation from screen coordinates to arc degrees. Use this navigator's range as a
            // metric for converting screen pixels to meters, and use the globe's radius for converting from meters
            // to arc degrees.
            var canvas = this.worldWindow.canvas,
                globe = this.worldWindow.globe,
                globeRadius = WWMath.max(globe.equatorialRadius, globe.polarRadius),
                // distance = WWMath.max(1, this.lookAt.range),
                // distance = WWMath.max(1, this.lookAt.lookAtLocation.altitude),
                distance = 20000000,
                metersPerPixel = WWMath.perspectivePixelSize(canvas.clientWidth, canvas.clientHeight, distance),
                forwardMeters = (ty - this.lastPoint[1]) * metersPerPixel,
                sideMeters = -(tx - this.lastPoint[0]) * metersPerPixel,
                forwardDegrees = (forwardMeters / globeRadius) * Angle.RADIANS_TO_DEGREES,
                sideDegrees = (sideMeters / globeRadius) * Angle.RADIANS_TO_DEGREES;

            // Apply the change in latitude and longitude to this navigator, relative to the current heading.
            var sinHeading = Math.sin(this.lookAt.heading * Angle.DEGREES_TO_RADIANS),
                cosHeading = Math.cos(this.lookAt.heading * Angle.DEGREES_TO_RADIANS);

            // this.lookAt.lookAtLocation.latitude += forwardDegrees * cosHeading - sideDegrees * sinHeading;
            // this.lookAt.lookAtLocation.longitude += forwardDegrees * sinHeading + sideDegrees * cosHeading;

            this.lookAt.heading -= sideDegrees;
            this.lookAt.tilt += forwardDegrees;

            this.lastPoint.set(tx, ty);
            this.lastDegrees.set(forwardDegrees, sideDegrees);
            this.applyLimits(this.lookAt);
            this.worldWindow.redraw();
        }
        else if (state === WorldWind.ENDED) {
            this.panEnd = Date.now();
            var isContinuous = false;
            if (this.isContinuousInertial()) {
                isContinuous = true;
            }
            else if (this.panEnd - this.startTimestamp > 150) {
                return;
            }

            this.stopAnimation();

            var animated = {
                tx: this.lastDegrees[0],
                ty: this.lastDegrees[1]
            };

            var to = {
                tx: 0,
                ty: 0
            };

            var animationDuration = isContinuous ? Infinity : 1500;
            this.touchStart = 0;
            this.touchStartPosition[0] = -1;
            this.touchStartPosition[0] = -1;
            this.touchEndPosition[0] = -1;
            this.touchEndPosition[1] = -1;

            this.currentTween = new TWEEN.Tween(animated)
                .to(to, animationDuration)
                .easing(TWEEN.Easing.Sinusoidal.Out)
                .onStart(() => {
                    this.beginHeading = this.lookAt.heading;
                    this.beginTilt = this.lookAt.tilt;
                })
                .onUpdate(() => {
                    if (!isFinite(animated.tx) && !isFinite(animated.ty)) {
                        this.stopAnimation();
                        return;
                    }

                    var sinHeading = Math.sin(this.lookAt.heading * Angle.DEGREES_TO_RADIANS),
                        cosHeading = Math.cos(this.lookAt.heading * Angle.DEGREES_TO_RADIANS);

                    // this.lookAt.lookAtLocation.latitude += animated.tx * cosHeading - animated.ty * sinHeading;
                    // this.lookAt.lookAtLocation.longitude += animated.tx * sinHeading + animated.ty * cosHeading;

                    this.lookAt.heading -= animated.ty;
                    this.lookAt.tilt += animated.tx;

                    this.applyLimits(this.lookAt);
                    this.worldWindow.redraw();
                })
                .onComplete(() => {
                    this.stopAnimation();
                })
                .onStop(() => {
                    this.stopAnimation();
                })
                .start();

            this.animate();
        }
    }

    // handlePanOrDrag2D(recognizer) {
    //     var state = recognizer.state,
    //         x = recognizer.clientX,
    //         y = recognizer.clientY,
    //         tx = recognizer.translationX,
    //         ty = recognizer.translationY;

    //     if (state === WorldWind.BEGAN) {
    //         this.beginPoint.set(x, y);
    //         this.lastPoint.set(x, y);
    //         this.startTimestamp = Date.now();

    //         this.stopAnimation();
    //     } else if (state === WorldWind.CHANGED) {
    //         var x1 = this.lastPoint[0],
    //             y1 = this.lastPoint[1],
    //             x2 = this.beginPoint[0] + tx,
    //             y2 = this.beginPoint[1] + ty;
    //         this.lastPoint.set(x2, y2);

    //         var navState = this.currentState(),
    //             globe = this.worldWindow.globe,
    //             ray = navState.rayFromScreenPoint(this.worldWindow.canvasCoordinates(x1, y1)),
    //             point1 = new Vec3(0, 0, 0),
    //             point2 = new Vec3(0, 0, 0),
    //             origin = new Vec3(0, 0, 0);
    //         if (!globe.intersectsLine(ray, point1)) {
    //             return;
    //         }

    //         ray = navState.rayFromScreenPoint(this.worldWindow.canvasCoordinates(x2, y2));
    //         if (!globe.intersectsLine(ray, point2)) {
    //             return;
    //         }

    //         // Transform the original navigator state's modelview matrix to account for the gesture's change.
    //         var modelview = Matrix.fromIdentity();
    //         modelview.copy(navState.modelview);

    //         var modelTy = point2[1] - point1[1];
    //         var screenTy = y1 - y2;

    //         //this.get2DLatitudeLimits(navState, screenTy, modelTy);

    //         var translationY = this.get2DYTranslation(navState, screenTy, modelTy);
    //         modelview.multiplyByTranslation(point2[0] - point1[0], translationY, point2[2] - point1[2]);

    //         // Compute the globe point at the screen center from the perspective of the transformed navigator state.
    //         modelview.extractEyePoint(ray.origin);
    //         modelview.extractForwardVector(ray.direction);
    //         if (!globe.intersectsLine(ray, origin)) {
    //             return;
    //         }

    //         // Convert the transformed modelview matrix to a set of navigator properties, then apply those
    //         // properties to this navigator.
    //         var params = modelview.extractViewingParameters(origin, this.roll, globe, {});
    //         this.lookAtLocation.copy(params.origin);
    //         this.range = params.range;
    //         this.heading = params.heading;
    //         this.tilt = params.tilt;
    //         this.roll = params.roll;
    //         this.applyLimits();

    //         this.deltaLookAtLocation.latitude = this.lastLookAtLocation.latitude - this.lookAtLocation.latitude;
    //         this.deltaLookAtLocation.longitude = this.lastLookAtLocation.longitude - this.lookAtLocation.longitude;
    //         this.lastLookAtLocation.copy(this.lookAtLocation);
    //         this.pan2DInterpreted = true;

    //         this.worldWindow.redraw();
    //     }
    //     else if (state === WorldWind.ENDED) {
    //         if (!this.pan2DInterpreted) {
    //             return;
    //         }
    //         this.pan2DInterpreted = false;
    //         this.panEnd = Date.now();
    //         var isContinuous = false;
    //         if (this.isContinuousInertial()) {
    //             isContinuous = true;
    //         }
    //         else if(this.panEnd - this.startTimestamp > 150) {
    //             return;
    //         }

    //         this.stopAnimation();

    //         var animated = {
    //             tx: this.deltaLookAtLocation.latitude,
    //             ty: this.deltaLookAtLocation.longitude
    //         };

    //         var to = {
    //             tx: 0,
    //             ty: 0
    //         };

    //         var animationDuration = isContinuous ? Infinity : 1500;
    //         this.touchStart = 0;
    //         this.touchStartPosition[0] = -1;
    //         this.touchStartPosition[0] = -1;
    //         this.touchEndPosition[0] = -1;
    //         this.touchEndPosition[1] = -1;

    //         const {north, south} = this.get2DLatitudeLimits(navState, 0, 0);

    //         this.currentTween = new TWEEN.Tween(animated)
    //             .to(to, animationDuration)
    //             .easing(TWEEN.Easing.Sinusoidal.Out)
    //             .onStart(() => {
    //                 //this.beginHeading = this.heading;
    //                 //this.beginTilt = this.tilt;
    //             })
    //             .onUpdate(() => {
    //                 if (!isFinite(animated.tx) && !isFinite(animated.ty)) {
    //                     this.stopAnimation();
    //                     return;
    //                 }

    //                 this.lookAtLocation.latitude -= animated.tx;
    //                 this.lookAtLocation.latitude = WWMath.clamp(this.lookAtLocation.latitude, south, north);
    //                 this.lookAtLocation.longitude -= animated.ty;

    //                 this.applyLimits();
    //                 this.worldWindow.redraw();
    //             })
    //             .onComplete(() => {
    //                 this.stopAnimation();
    //             })
    //             .onStop(() => {
    //                 this.stopAnimation();
    //             })
    //             .start();

    //         this.animate();
    //     }
    // }

    handleFling(recognizer) {
    }

    handleSecondaryDrag(recognizer) {
        var state = recognizer.state,
        tx = recognizer.translationX,
        ty = recognizer.translationY;
        var navigator = this.wwd.navigator;
        if (state === WorldWind.BEGAN) {
            this.beginHeading = navigator.heading;
            this.beginTilt = navigator.tilt;
        } else if (state === WorldWind.CHANGED) {
            // Compute the current translation from screen coordinates to degrees. Use the canvas dimensions as a
            // metric for converting the gesture translation to a fraction of an angle.
            var headingDegrees = 180 * tx / this.wwd.canvas.clientWidth,
                tiltDegrees = 90 * ty / this.wwd.canvas.clientHeight;
            // Apply the change in heading and tilt to this navigator's corresponding properties.
            navigator.heading = this.beginHeading + headingDegrees;
            navigator.tilt = this.beginTilt + tiltDegrees;
            this.applyLimits();
            this.wwd.redraw();
        }
    }

    isContinuousInertial() {
        const longPressTime = this.startTimestamp - this.touchStart;
        const travelTime = this.panEnd - this.startTimestamp;
        return (
            !this.preventContinuousInnertial &&
            this.touchStart !== 0 &&
            this.startTimestamp !== 0 &&
            this.panEnd !== 0 &&
            longPressTime >= 2000 &&
            travelTime <= 150
        );
    }


    /**
     * This function handles the behavior of the Navigator on the wheel event. In this case it is zooming in or out from
     * the fixed point.
     * @param recognizer
     */
    handleWheelEvent (event) {
        const lookAt = this.lookAt;
        // Normalize the wheel delta based on the wheel delta mode. This produces a roughly consistent delta across
        // browsers and input devices.
        var normalizedDelta;
        if (event.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
            normalizedDelta = event.deltaY;
        } else if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            normalizedDelta = event.deltaY * 40;
        } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            normalizedDelta = event.deltaY * 400;
        }

        // Compute a zoom scale factor by adding a fraction of the normalized delta to 1. When multiplied by the
        // navigator's range, this has the effect of zooming out or zooming in depending on whether the delta is
        // positive or negative, respectfully.
        var scale = 1 + (normalizedDelta / 1000);

        // Apply the scale to this navigator's properties.
        lookAt.range *= scale;

        this.applyLimits(lookAt);
        this.worldWindow.redraw();
    };

    handleRotation(recognizer) {
    }

    handleTilt(recognizer) {
    }

    handlePinch(recognizer) {
        var state = recognizer.state,
            scale = recognizer.scale;
        if (state === WorldWind.BEGAN) {
            this.beginRange = this.lookAt.range;
        } else if (state === WorldWind.CHANGED) {
            if (scale !== 0) {
                // Apply the change in pinch scale to this navigator's range, relative to the range when the gesture
                // began.
                this.lookAt.range = this.beginRange / scale;
                this.applyLimits(this.lookAt);
                this.worldWindow.redraw();
            }
        }
    }

animate() {
    this.animationId = requestAnimationFrame(this.animate);
    this.isAnimating = true;
    TWEEN.update();
}

stopAnimation() {
    TWEEN.removeAll();
    window.cancelAnimationFrame(this.animationId);
    this.isAnimating = false;
    if (this.currentTween) {
        this.currentTween.stop();
    }
}


    /**
     * Heading must always remain in the bounds: -2PI, 2PI
     * Tilt must always remain in the bounds: -PI, PI
     * @param state
     */
    applyLimits(state) {
        if(state.tilt < 0) {
            state.heading -= 180;
            state.tilt = 0 - state.tilt;
            this.sign = -this.sign;

            if(state.roll === 180) {
                state.roll = 0;
            } else {
                state.roll = 180;
            }
        } else if (state.tilt > 180) {
            state.heading -= 180;
            state.tilt = 180 - (state.tilt - 180);
            this.sign = -this.sign;

            if(state.roll === 180) {
                state.roll = 0;
            } else {
                state.roll = 180;
            }
        } else if (state.tilt > 100) {
            state.tilt = 100;
        }

        if(state.heading < 0) {
            state.heading += 360;
        } else if(state.heading > 360) {
            state.heading -= 360;
        }

        if(state.roll > 180) {
            state.roll -=  180;
        } else if (state.roll < 0) {
            state.roll += 180;
        }

        if(state.range >= (40 * state.lookAtLocation.altitude)) {
            state.range = 40 * state.lookAtLocation.altitude;
        }

        if(state.range <= 230000) {
            state.range = 230000;
        }
    };
}

export default FixedPointController;