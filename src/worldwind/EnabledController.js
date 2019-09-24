import WorldWind from 'webworldwind-gisat';
import FixedPointController from "./FixedPointController";

const {
    BasicWorldWindowController
} = WorldWind;

class EnabledController extends BasicWorldWindowController {
    constructor(worldWindow) {
        super(worldWindow);

        this._enabled = true;
        this._isFixed = false;

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
                super.handlePanOrDrag(recognizer);
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
                super.handleSecondaryDrag(recognizer);
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
}

export default EnabledController;