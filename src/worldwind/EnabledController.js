import WorldWind from 'webworldwind-gisat';

const {
    BasicWorldWindowController
} = WorldWind;

class EnabledController extends BasicWorldWindowController {
    constructor(worldWindow) {
        super(worldWindow);

        this._enabled = true;
    }

    enable() {
        this._enabled = true;
    }

    disable() {
        this._enabled = false;
    }

    handlePanOrDrag(recognizer) {
        if(this._enabled) {
            super.handlePanOrDrag(recognizer);
        }
    }

    handleFling(recognizer) {
        if(this._enabled) {
            super.handleFling(recognizer);
        }
    }

    handlePinch(recognizer) {
        if(this._enabled) {
            super.handlePinch(recognizer);
        }
    }

    handleSecondaryDrag(recognizer) {
        if(this._enabled) {
            super.handleSecondaryDrag(recognizer);
        }
    }

    handleRotation(recognizer) {
        if(this._enabled) {
            super.handleRotation(recognizer);
        }
    }

    handleTilt(recognizer) {
        if(this._enabled) {
            super.handleTilt(recognizer);
        }
    }

    handleWheelEvent(recognizer) {
        if(this._enabled) {
            super.handleWheelEvent(recognizer);
        }
    }
}

export default EnabledController;