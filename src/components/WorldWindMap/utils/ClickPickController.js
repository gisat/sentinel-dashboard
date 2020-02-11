const CLICK_DELAY = 200; //ms
const CLICK_MIN_TIME = 50; //ms
const TYPE_TIMEOUT = 'timeoutClick';
const TYPE_COMMON = 'commonClick';
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
	 * @param {Function} cb A callback function to call with the current clicked renderables after mouseUp/touchEnd.
	 * @param {number} clickDelay Ignore click longer than clickDelay
	 * @param {number} minClickTime Minimum click time to be registered
	 * @param {number} clickTimeout After this time will be triggered callback
	 */
	constructor(wwd, cb, clickDelay = CLICK_DELAY, minClickTime = CLICK_MIN_TIME, clickTimeout) {
		this.clickTimeout = clickTimeout;
		this.clickDelay = clickDelay;
		this.minClickTime = minClickTime;
        this.mouseDown = false;
        this.tpCache = [];
        this.clickTimeoutKey = null;
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

	getRenderablesByMouse(wwd, cb, event, x, y, type) {
			const pickList = wwd.pick(wwd.canvasCoordinates(x, y));

			if (cb) {
				const timeDiff = this.getClickTime();
				cb(pickList, event, x, y, timeDiff, type);
			}
	}

	getClickTime() {
		if(this.clickTimeoutKey && this.clickTimeoutKey.time) {
			const curTime = new Date().getTime();
			const timeDiff = curTime - this.clickTimeoutKey.time;
			return timeDiff;
		} else {
			return null;
		}
	}

	/**
	 * Check if minClickTime is set and if click is longer than it.
	 */
	couldClick() {
		if(this.minClickTime && typeof this.minClickTime === 'number') {
			const timeDiff = this.getClickTime();
			if(timeDiff > this.minClickTime) {
				return true;
			} else {
				return false;
			}
		} else {
			return true;
		}
	}

    onClick(wwd, cb, evt, x, y, type) {
        this.getRenderablesByMouse(wwd, cb, evt, x, y, type);
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
        if(this.clickTimeoutKey && this.clickTimeoutKey.key) {
            window.clearTimeout(this.clickTimeoutKey.key);
            this.clickTimeoutKey = null;
        }
    }

    setClickTimeout(key) {
        if(key) {
            this.clickTimeoutKey = {
				key,
				time: new Date().getTime()
			};
        }
    }

    setPointerDownTimeout(wwd, cb, evt) {
        const clickKey = window.setTimeout(() => {
			this.resetClickTimeout();
        }, this.clickDelay);

		this.setClickTimeout(clickKey);
		

		if(this.clickTimeout && typeof this.clickTimeout === 'number') {
			let x,y;
			if(evt.changedTouches && evt.changedTouches.length === 1 && this.clickTimeoutKey) {
				x = evt.changedTouches[0].clientX;
				y = evt.changedTouches[0].clientY;
			} else {
				x = evt.clientX;
				y = evt.clientY;
			}

			window.setTimeout(() => {
				if(this.couldClick() && this.clickTimeoutKey) {
					this.onClick(wwd, cb, evt, x, y, TYPE_TIMEOUT);
				}	
			}, this.clickTimeout);
	
		}
    }

	onTouchStart(wwd, cb, evt) {
        if(this.tpCache.length > 0) {
			for (let i = 0; i < evt.touches.length; i++) {
				this.removeTouchEventByIdentifier(evt.touches[i].identifier);
			}
		}
		// Cache the touch points for later processing of 2-touch pinch/zoom
		this.cacheEvents(evt.touches);

        //clear clickTimeoutKey
        this.resetClickTimeout();

        if(evt.touches.length === 1) {
            this.setPointerDownTimeout(wwd, cb, evt);
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

        if(evt.changedTouches.length === 1 && this.clickTimeoutKey) {
			const x = evt.changedTouches[0].clientX;
			const y = evt.changedTouches[0].clientY;
			//kontrola timeoutu
			if(this.couldClick()) {
				this.onClick(wwd, cb, evt, x, y, TYPE_COMMON);
			}
			this.resetClickTimeout();
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
        this.setPointerDownTimeout(wwd, cb, evt);
	}
	onMouseUp(wwd, cb, evt) {
        if(this.clickTimeoutKey) {
			const x = evt.clientX;
			const y = evt.clientY;
			//kontrola timeoutu
			if(this.couldClick()) {
				this.onClick(wwd, cb, evt, x, y, TYPE_COMMON);
			}
			this.resetClickTimeout();
        }
    }

	onMouseMove() {
        this.resetClickTimeout();
    }
}

export default ClickPickController;