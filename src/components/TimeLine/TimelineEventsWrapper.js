import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Context as TimeLineContext} from './context';

const getClientXFromEvent = (evt) => {
	let clientX;
	const touch = evt.touches && evt.touches[0] || evt.changedTouches && evt.changedTouches[0]
	if(touch) {
		clientX = touch.clientX;
	} else {
		clientX = evt.clientX;
	}
	return clientX;
}


class TimelineEventsWrapper extends React.PureComponent {
	static defaultProps = {}

	static contextType = TimeLineContext;
	constructor(props){
		super(props);

		this.node = React.createRef();
		this._drag = null;
		this._lastX = null;
		this._mouseDownX = null;
		this.decelerating = false;
		this._pointerLastX = null;
		this.multiplier = 5;
		this.friction = 0.91; //default 0.92
		this.stopThreshold = 0.3;
		this.targetX = 0;
		this.trackingPoints = [];
		this.decVelX = 0;

		this.onWheel = this.onWheel.bind(this);
		this.onPinch = this.onPinch.bind(this);
		this.onDrag = this.onDrag.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
	}
	componentDidMount() {
		this.node.current.addEventListener('gesturechange', this.onPinch);
		this.node.current.addEventListener('touchstart', this.onTouchStart);
		this.node.current.addEventListener('touchend', this.onTouchEnd);
		this.node.current.addEventListener('touchmove', this.onMouseMove);
	}
	
	componentWillUnmount() {
		this.node.current.removeEventListener('gesturechange', this.onPinch);
		this.node.current.removeEventListener('touchstart', this.onTouchStart);
		this.node.current.removeEventListener('touchend', this.onTouchEnd);
		this.node.current.removeEventListener('touchmove', this.onMouseMove);
	}

	onMouseUp(e) {		
		const clientX = getClientXFromEvent(e);
		const isClick = Math.abs(this._mouseDownX - clientX) < 1;
		this._drag = false;
		this._lastX = null;
		this._mouseDownX = null;
		if (isClick) {
			this.onClick(e)
		}

		this.stopTracking();
	}

	onMouseDown(e) {
		this._drag = true;
		this.trackingPoints = [];
		this._lastX = getClientXFromEvent(e);
		this._pointerLastX = getClientXFromEvent(e);
		this._mouseDownX = getClientXFromEvent(e);
		this.addTrackingPoint(this._pointerLastX);
	}

	onClick(e) {
		const {width} = this.context;
		const clickX = getClientXFromEvent(e);
		const centerX = width / 2;

		const distance = centerX - clickX

		//todo animate
		this.onDrag({
			distance: Math.abs(distance),
			direction: distance < 0 ? 'future': 'past'
		});
	}

	onTouchStart = (evt) => {
		evt.stopPropagation();
		evt.preventDefault();
	
		this.onMouseDown(evt);
	}

	onTouchEnd = (evt) => {
		evt.stopPropagation();
		evt.preventDefault();
		this.onMouseUp(evt);
	}
	
	onMouseMove(e) {
		
		const clientX = getClientXFromEvent(e);
		
		this.context.updateContext({
			mouseX: clientX,
			mouseTime: this.context.getTime(clientX)
		});
		
		if(this._drag) {
			let distance = clientX - this._lastX;
			// debugger
			if(distance !== 0) {
				this.onDrag({
					distance: Math.abs(distance),
					direction: distance < 0 ? 'future': 'past'
				});

				this._lastX = clientX;

				this.registerMovements(clientX);
			}
			e.preventDefault();
		}
	}


	/**
	 * When the user drags the timeline, if it is still permitted, it updates the available and visible period and
	 * therefore redraws the information.
	 * @param dragInfo {Object}
	 * @param dragInfo.distance {Number} Amount of pixels to move in given direction
	 * @param dragInfo.direction {String} Either past or future. Based on this.
	 */
	onDrag(dragInfo) {
		const {dayWidth, period, periodLimit, width, updateContext} = this.context;
		const allDays = this.context.width / dayWidth;
		const halfDays = allDays / 2;
		const periodStart = moment(period.start);
    	const periodEnd = moment(period.end);
		let periodLimitStart =  moment(periodLimit.start)
		let periodLimitEnd = moment(periodLimit.end)
		let periodLimitCenter = moment(periodLimit.end).subtract(halfDays * (60 * 60 * 24 * 1000), 'ms')

    // Either add  to start and end.
		let daysChange = Math.abs(dragInfo.distance) / dayWidth;
		if(dragInfo.direction === 'past') {
			periodLimitStart.subtract(daysChange * (60 * 60 * 24 * 1000), 'ms');
	    	periodLimitEnd.subtract(daysChange * (60 * 60 * 24 * 1000), 'ms');
	    	periodLimitCenter.subtract(daysChange * (60 * 60 * 24 * 1000), 'ms');
			
			if(periodLimitCenter.isBefore(periodStart)) {
				//use last period limit
				periodLimitStart = moment(periodLimit.start);
				periodLimitEnd = moment(periodLimit.end);
			}
		} else {
			periodLimitStart.add(daysChange * (60 * 60 * 24 * 1000), 'ms');
			periodLimitEnd.add(daysChange * (60 * 60 * 24 * 1000), 'ms');
			periodLimitCenter.add(daysChange * (60 * 60 * 24 * 1000), 'ms');

			if(periodLimitCenter.isAfter(periodEnd)) {
				//use last period limit
				periodLimitStart = moment(periodLimit.start);
				periodLimitEnd = moment(periodLimit.end);
			}
		}

		let widthOfTimeline = width;
		// If the result is smaller than width of the timeline
		let widthOfResult = (periodLimitEnd.diff(periodLimitStart, 'ms') / (60 * 60 * 24 * 1000)) * dayWidth;
		// Make sure that we stay within the limits.
		if(widthOfResult < widthOfTimeline) {
			let daysNeededToUpdate = (widthOfTimeline - widthOfResult) / dayWidth;
			if(dragInfo.direction === 'past') {
				periodLimitEnd.add(daysNeededToUpdate * (60 * 60 * 24 * 1000), 'ms');
			} else {
				periodLimitStart.subtract(daysNeededToUpdate * (60 * 60 * 24 * 1000), 'ms');
			}
		}

		updateContext({
			periodLimit: {
				end: periodLimitEnd,
				start: periodLimitStart
			}
		});
	}


	/**
	 * Handles move events
	 * @param  {clientX} ev Normalized event
	 */
 	 registerMovements(clientX) {
		if (this._drag) {
			this.addTrackingPoint(this._lastX);
		}

		const pointerChangeX = this._lastX - this._pointerLastX;

		this.targetX += pointerChangeX * this.multiplier;

		this._pointerLastX = this._lastX;
	}


	/**
	 * Records movement for the last 100ms
	 * @param {number} x
	 */
	addTrackingPoint(x) {
		var time = Date.now();
		while (this.trackingPoints.length > 0) {
			if (time - this.trackingPoints[0].time <= 100) {
				break;
			}
			this.trackingPoints.shift();
		}

		this.trackingPoints.push({x, time});
	}

	/**
	 * Stops movement tracking, starts animation
	 */
	stopTracking() {
		this.addTrackingPoint(this._pointerLastX);
		
		this.startDecelAnim();
	}


    /**
     * Initialize animation of values coming to a stop
     */
    startDecelAnim() {
		const firstPoint = this.trackingPoints[0];
		const lastPoint = this.trackingPoints[this.trackingPoints.length - 1];
  
		const xOffset = lastPoint.x - firstPoint.x;
		const timeOffset = lastPoint.time - firstPoint.time;
  
		const D = (timeOffset / 15) / this.multiplier;
  
		this.decVelX = (xOffset / D) || 0; // prevent NaN
  
		//check difference start/stop
		if ((Math.abs(this.decVelX) > 1)) {
			this.decelerating = true;
			// end
			requestAnimFrame(() => this.stepDecelAnim());
		} else {
		  this.clearScroll()
		}
	}


  /**
   * Animates values slowing down
   */
  stepDecelAnim() {
    if (!this.decelerating) {
        return;
    }

    this.decVelX *= this.friction;

    this.targetX += this.decVelX;
    
    if (Math.abs(this.decVelX) > this.stopThreshold) {

		this.onDrag({
			distance: Math.abs(this.decVelX),
			direction: this.decVelX < 0 ? 'future': 'past'
		});

        requestAnimFrame(this.stepDecelAnim.bind(this));
    } else {
        this.clearScroll();
    }
  }

	clearScroll() {
		this.decelerating = false;
	  }

	onMouseLeave(e) {
		this._drag = false;
		this._lastX = null;
		this._mouseDownX = null;

		this.context.updateContext({
			mouseX: null,
			mouseTime: null
		});

	}

	/**
	 * Based on the amount of pixels the wheel moves update the size of the visible pixels.
	 * @param e {SyntheticEvent}
	 *
	 */
	onWheel(e) {
		const {dayWidth} = this.context;
		e.preventDefault();
		let change;

		if (e.deltaY > 0) {
			// zoom out
			change = 1 - Math.abs(e.deltaY / (10 * 100));
		} else {
			// zoom in
			change = 1 + Math.abs(e.deltaY / (10 * 100));
		}

		let newWidth = dayWidth * change;
		this.zoom(newWidth);
	}

	onPinch(e) {
		const {dayWidth} = this.context;
		e.preventDefault();
		let change;
		if (e.scale > 1) {
			// zoom out
			change = 1 + e.scale / 10;
		} else {
			// zoom in
			change = 1 - e.scale / 10;
		}

		let newWidth = dayWidth * change;
		this.zoom(newWidth);
	}

	zoom(newWidth) {
		const {mouseX, getTime, updateContext, period} = this.context;
		let mouseTime = getTime(mouseX);
		if(newWidth > this.context.maxDayWidth) {
			newWidth = this.context.maxDayWidth;
		}

		//don't allow zoom out outside initial zoom
		if (newWidth < this.context.minDayWidth) {
			newWidth = this.context.minDayWidth;
		}

		let beforeMouseDays = this.context.mouseX / newWidth;
		let allDays = this.context.width / newWidth;

		let start = moment(mouseTime).subtract(moment.duration(beforeMouseDays * (60 * 60 * 24 * 1000), 'ms'));
		let end = moment(start).add(moment.duration(allDays * (60 * 60 * 24 * 1000), 'ms'));

		//Don't allow zoom center out of period
		let center = moment(start).add(moment.duration((allDays / 2) * (60 * 60 * 24 * 1000), 'ms'));

		if(center.isBefore(period.start)) {
			const startDiff = period.start.diff(center, 'ms');
			start.add(startDiff, 'ms')
			end.add(startDiff, 'ms')
		}

		if(center.isAfter(period.end)) {
			const startDiff = period.end.diff(center, 'ms');
			start.add(startDiff, 'ms')
			end.add(startDiff, 'ms')
		}

		updateContext({
			periodLimit: {
				start: start,
				end: end
			}
		});
	}


	render() {
		const {children} = this.props;
		const {periodLimit, dayWidth} = this.context;
		
		const childrenWithProps = React.cloneElement(children, {
			period: periodLimit,
			dayWidth
		  })
		return (
			<div
				ref={this.node}
				className="ptr-timeline-content"
				onMouseLeave={this.onMouseLeave}
				onWheel={this.onWheel}
				onMouseDown={this.onMouseDown}
				onMouseUp={this.onMouseUp}
				onMouseMove={this.onMouseMove}
			>
				{childrenWithProps}
			</div>
		);
	}

}



/**
 * @see http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
const requestAnimFrame = (function(){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
  })();
  

export default TimelineEventsWrapper;
