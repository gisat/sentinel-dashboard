"use strict";

import WorldWind from 'webworldwind-gisat';

const {
    BEGAN,
    CHANGED,
    Vec2,
    WWMath
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
    }

    get navigator() {
        return this.worldWindow.navigator;
    }

    get globe() {
        return this.worldWindow.globe;
    }

    handlePanOrDrag (recognizer) {
        var state = recognizer.state,
            speedFactor = 20,
            lookAt = this.lookAt;

        if (state === BEGAN) {
            this.lastPoint.set(recognizer.clientX, recognizer.clientY);
        } else if (state === CHANGED) {
            var canvas = this.worldWindow.canvas,
                distance = WWMath.max(1, lookAt.range), // The distance should be relevant only with respect to the range object we are using.
                metersPerPixel = WWMath.perspectivePixelSize(canvas.clientWidth, canvas.clientHeight, distance),
                forwardDegrees = ((recognizer.clientX - this.lastPoint[0]) * metersPerPixel / distance) * speedFactor, // 5 is speed factor.
                sideDegrees = ((recognizer.clientY - this.lastPoint[1]) * metersPerPixel / distance) * speedFactor;

            lookAt.heading += forwardDegrees;
            lookAt.tilt += (sideDegrees * this.sign);

            this.applyLimits(lookAt);
            this.worldWindow.redraw();
        }
    };

    handleFling(recognizer) {
    }

    /**
     * This function handles the behavior of the Navigator on the wheel event. In this case it is zooming in or out from
     * the fixed point.
     * @param recognizer
     */
    handleWheelEvent (recognizer) {};

    handleRotation(recognizer) {
    }

    handleTilt(recognizer) {
    }

    /**
     * Basically it handles a pinch gesture done by touching the screen.
     * @param recognizer
     */
    handlePinch(recognizer) {};

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

        if(state.range >= (2 * state.lookAtLocation.altitude)) {
            state.range = 2 * state.lookAtLocation.altitude;
        }
    };
}

export default FixedPointController;