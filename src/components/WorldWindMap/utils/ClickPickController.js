const CLICK_DELAY = 200; //ms
/**
 * @exports ClickPickController
 */
class ClickPickController {
	/**
	 * Constructs a ClickPickController.
	 * @alias ClickPickController
	 * @constructor
	 * @classdesc The ClickPickController
	 * @param {WorldWindow} wwd The WorldWindow instance.
	 * @param {Function} cb A callback function to call with the current clicked renderables.
	 */
	constructor(wwd, cb) {
        this.mouseDown = false;
        this.pendingClick = false;
        this.tpCache = [];
        this.clickTimeout = null;
		this.eventListener = this.eventListener.bind(this, wwd, cb);

		const events = ['mousedown', 'mouseup', 'mousemove', 'touchstart', 'touchend', 'touchmove'];
		events.forEach(event => {
			wwd.addEventListener(event, this.eventListener);
		});
	}

	eventListener(wwd, cb, event) {
		switch (event.type) {
			case 'touchmove':
				this.onTouchMove(cb, event);
				return;
			case 'mousemove':
				this.onMouseMove(wwd, cb, event, true);
				return;
			case 'touchstart':
                this.onTouchStart(wwd, cb, event);
                return;
			case 'mousedown':
				this.onMouseDown(wwd, cb, event);
				return;
			case 'touchend':
				this.onTouchEnd(wwd, cb, event);
				return;	
			case 'mouseup':
				this.onMouseUp(wwd, cb, event);
				return;
		}
	}

	getRenderablesByMouse(wwd, cb, event, x, y) {
			const pickList = wwd.pick(wwd.canvasCoordinates(x, y));

			if (cb) {
				cb(pickList, event);
			}
	}

    onClick(wwd, cb, evt, x, y) {
        this.getRenderablesByMouse(wwd, cb, evt, x, y);
    }

	clearTouchEventCache() {
		this.tpCache = [];
	}

	removeTouchEventByIdentifier(identifier) {
		this.tpCache = this.tpCache.filter((ev) => {
			return ev.identifier !== identifier;
		});
    }
    
	cacheEvents(evts) {
		for (let i=0; i < evts.length; i++) {
			this.tpCache.push(evts[i]);
		}
    }

    resetClickTimeout() {
        if(this.clickTimeout) {
            window.clearTimeout(this.clickTimeout);
            this.clickTimeout = null;
            this.pendingClick = false;
        }
    }

    setClickTimeout(key) {
        if(key) {
            this.clickTimeout = key;
        }
    }

    setPointerDownTimeout() {
        this.pendingClick = true;
        const clickKey = window.setTimeout(() => {
                this.pendingClick = false;
                this.resetClickTimeout();
        }, CLICK_DELAY);

        this.setClickTimeout(clickKey);
    }

	onTouchStart(wwd, cb, evt) {
        if(this.tpCache.length > 0) {
			for (let i = 0; i < evt.touches.length; i++) {
				this.removeTouchEventByIdentifier(evt.touches[i].identifier);
			}
		}
		// Cache the touch points for later processing of 2-touch pinch/zoom
		this.cacheEvents(evt.touches);

        //clear clickTimeout
        this.resetClickTimeout();

        if(evt.touches.length === 1) {
            this.setPointerDownTimeout();
        }
	}
	onTouchEnd(wwd, cb, evt) {

		//remove from cache by identifier		
		for (let i = 0; i < evt.changedTouches.length; i++) {
			this.removeTouchEventByIdentifier(evt.changedTouches[i].identifier);
		}

		//FIX - sometime touchend or touchcancel is not called and touch stick in cache 
		if(evt.touches.length === 0 && this.tpCache.length > 0) {
			this.clearTouchEventCache();
        }

        if(evt.changedTouches.length === 1 && this.pendingClick === true) {
			this.resetClickTimeout();
			const x = evt.changedTouches[0].clientX;
			const y = evt.changedTouches[0].clientY;
            this.onClick(wwd, cb, evt, x, y);
        }

    }
    
	onTouchMove(cb, event) {
        //identify touch by one touch
        if(this.tpCache.length === 1) {
            this.clearTouchEventCache();
            this.resetClickTimeout();
        }
    }

	onMouseDown(wwd, cb, evt) {
        this.resetClickTimeout();
        this.setPointerDownTimeout();
	}
	onMouseUp(wwd, cb, evt) {
        if(this.pendingClick === true) {
			this.resetClickTimeout();
			const x = evt.clientX;
			const y = evt.clientY;

            this.onClick(wwd, cb, evt, x, y);
        }
    }

	onMouseMove() {
        this.resetClickTimeout();
    }
}

export default ClickPickController;