import WorldWind from 'webworldwind-esa';
import FixedPointController from "./FixedPointController";
import TWEEN from '@tweenjs/tween.js';

const {
    BasicWorldWindowController,
    WWMath,
    Angle,
    Vec2,
} = WorldWind;

class EnabledController extends BasicWorldWindowController {
    constructor(worldWindow) {
        super(worldWindow);

        this._enabled = true;
        this._isFixed = false;

        this.isAnimating = false;
        this.animate = this.animate.bind(this);
        this.handlePanOrDrag = this.handlePanOrDrag.bind(this);
        this.animationId = null;
        this.currentTween = null;

        this.panEnd = 0;
        this.startTimestamp = 0;
        this.touchStart = 0;
        this.touchStartPosition = [-1, -1];
        this.touchEndPosition = [-1, -1];
        this.lastDegrees = new Vec2(0, 0);
        this.fixedController = new FixedPointController(worldWindow);
    }

    enable() {
        this._enabled = true;
    }

    disable() {
        this._enabled = false;
    }

    handlePanOrDrag(recognizer) {
        if(this._enabled) {
            if(!this._isFixed) {
                if (this.wwd.globe.is2D()) {
                    super.handlePanOrDrag2D(recognizer);
                } else {
                    this.handlePanOrDrag3D(recognizer);
                }
            } else {
                this.fixedController.handlePanOrDrag(recognizer);
            }
        }
    }


    handleFling(recognizer) {
        if(this._enabled) {
            if(!this._isFixed) {
                super.handleFling(recognizer);
            } else {
                this.fixedController.handleFling(recognizer);
            }
        }
    }

    handlePinch(recognizer) {
        if(this._enabled) {
            if(!this._isFixed) {
                super.handlePinch(recognizer);
            } else {
                this.fixedController.handlePinch(recognizer);
            }
        }
    }

    handleSecondaryDrag(recognizer) {
        if(this._enabled) {
            if(!this._isFixed) {
                this.handleSecondaryDrag(recognizer);
            } else {
                this.fixedController.handleSecondaryDrag(recognizer);
            }
        }
    }

    handleRotation(recognizer) {
        if(this._enabled) {
            if(!this._isFixed) {
                super.handleRotation(recognizer);
            } else {
                this.fixedController.handleRotation(recognizer);
            }
        }
    }

    handleTilt(recognizer) {
        if(this._enabled) {
            if(!this._isFixed) {
                super.handleTilt(recognizer);
            } else {
                this.fixedController.handleTilt(recognizer);
            }
        }
    }

    handleWheelEvent(recognizer) {
        if(this._enabled) {
            if(!this._isFixed) {
                super.handleWheelEvent(recognizer);
            } else {
                this.fixedController.handleWheelEvent(recognizer);
            }
        }
    }

    applyLimits() {
        if(!this._isFixed) {
            super.applyLimits()
        } else {
            this.fixedController.applyLimits(this.wwd.navigator);
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
            var canvas = this.wwd.canvas,
                globe = this.wwd.globe,
                globeRadius = WWMath.max(globe.equatorialRadius, globe.polarRadius),
                distance = WWMath.max(1, this.wwd.navigator.range),
                metersPerPixel = WWMath.perspectivePixelSize(canvas.clientWidth, canvas.clientHeight, distance),
                forwardMeters = (ty - this.lastPoint[1]) * metersPerPixel,
                sideMeters = -(tx - this.lastPoint[0]) * metersPerPixel,
                forwardDegrees = (forwardMeters / globeRadius) * Angle.RADIANS_TO_DEGREES,
                sideDegrees = (sideMeters / globeRadius) * Angle.RADIANS_TO_DEGREES;

            // Apply the change in latitude and longitude to this navigator, relative to the current heading.
            var sinHeading = Math.sin(this.wwd.navigator.heading * Angle.DEGREES_TO_RADIANS),
                cosHeading = Math.cos(this.wwd.navigator.heading * Angle.DEGREES_TO_RADIANS);

            this.wwd.navigator.lookAtLocation.latitude += forwardDegrees * cosHeading - sideDegrees * sinHeading;
            this.wwd.navigator.lookAtLocation.longitude += forwardDegrees * sinHeading + sideDegrees * cosHeading;
            this.lastPoint.set(tx, ty);
            this.lastDegrees.set(forwardDegrees, sideDegrees);
            this.applyLimits();
            this.wwd.redraw();
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
                    this.beginHeading = this.wwd.navigator.heading;
                    this.beginTilt = this.wwd.navigator.tilt;
                })
                .onUpdate(() => {
                    if (!isFinite(animated.tx) && !isFinite(animated.ty)) {
                        this.stopAnimation();
                        return;
                    }

                    var sinHeading = Math.sin(this.wwd.navigator.heading * Angle.DEGREES_TO_RADIANS),
                        cosHeading = Math.cos(this.wwd.navigator.heading * Angle.DEGREES_TO_RADIANS);

                    this.wwd.navigator.lookAtLocation.latitude += animated.tx * cosHeading - animated.ty * sinHeading;
                    this.wwd.navigator.lookAtLocation.longitude += animated.tx * sinHeading + animated.ty * cosHeading;

                    this.applyLimits();
                    this.wwd.redraw();
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

    handleSecondaryDrag(recognizer) {
        var state = recognizer.state,
            tx = recognizer.translationX,
            ty = recognizer.translationY;

        if (state === WorldWind.BEGAN) {
            this.beginHeading = this.wwd.navigator.heading;
            this.beginTilt = this.wwd.navigator.tilt;
            this.startTimestamp = Date.now();

            this.stopAnimation();
        }
        else if (state === WorldWind.CHANGED) {
            // Compute the current translation from screen coordinates to degrees. Use the canvas dimensions as a
            // metric for converting the gesture translation to a fraction of an angle.
            var headingDegrees = 180 * tx / this.wwd.canvas.clientWidth,
                tiltDegrees = 90 * ty / this.wwd.canvas.clientHeight;

            // Apply the change in heading and tilt to this navigator's corresponding properties.
            this.wwd.navigator.heading = this.beginHeading + headingDegrees;
            this.wwd.navigator.tilt = this.beginTilt + tiltDegrees;

            this.lastPoint.set(headingDegrees, tiltDegrees);


            this.applyLimits();
            this.wwd.redraw();
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
                tx: this.lastPoint[0] / 5,
                ty: this.lastPoint[1] / 8
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
                    this.beginHeading = this.wwd.navigator.heading;
                    this.beginTilt = this.wwd.navigator.tilt;
                })
                .onUpdate(() => {
                    if (!isFinite(animated.tx) && !isFinite(animated.ty)) {
                        this.stopAnimation();
                        return;
                    }

                    this.wwd.navigator.heading += animated.tx;
                    this.wwd.navigator.tilt += animated.ty;
 
                    this.applyLimits();
                    this.wwd.redraw();
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
}

export default EnabledController;