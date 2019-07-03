import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Context as TimeLineContext} from './context';

const getClientXFromEvent = (evt) => {
	let clientX;
	const isTouch = evt.touches && evt.touches[0]
	if(isTouch) {
		clientX = evt.touches[0].clientX;
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

		this.onWheel = this.onWheel.bind(this);
		this.onPinch = this.onPinch.bind(this);
		this.onDrag = this.onDrag.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
	}
	componentDidMount() {
		this.node.current.addEventListener('gesturechange', this.onPinch);
		this.node.current.addEventListener('touchstart', this.onMouseDown);
		this.node.current.addEventListener('touchend', this.onMouseUp);
		this.node.current.addEventListener('touchmove', this.onMouseMove);
	}
	
	componentWillUnmount() {
		this.node.current.removeEventListener('gesturechange', this.onPinch);
		this.node.current.removeEventListener('touchstart', this.onMouseDown);
		this.node.current.removeEventListener('touchend', this.onMouseUp);
		this.node.current.removeEventListener('touchmove', this.onMouseMove);
	}

	onMouseUp() {
		this._drag = false;
		this._lastX = null;
	}
	onMouseDown(e) {
		this._drag = true;
		this._lastX = getClientXFromEvent(e);;
	}
	
	onMouseMove(e) {
		
		const clientX = getClientXFromEvent(e);
		
		this.context.updateContext({
			mouseX: clientX
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
		const periodStart = moment(period.start);
    	const periodEnd = moment(period.end);
		let periodLimitStart =  moment(periodLimit.start)
		let periodLimitEnd = moment(periodLimit.end)

    // Either add  to start and end.
		let daysChange = Math.abs(dragInfo.distance) / dayWidth;
		if(dragInfo.direction === 'past') {
			periodLimitStart.subtract(daysChange * (60 * 60 * 24 * 1000), 'ms');
	    	periodLimitEnd.subtract(daysChange * (60 * 60 * 24 * 1000), 'ms');
			
			if(periodLimitStart.isBefore(periodStart)) {
				//use last period limit
				periodLimitStart = moment(periodLimit.start);
				periodLimitEnd = moment(periodLimit.end);
			}
		} else {
			periodLimitStart.add(daysChange * (60 * 60 * 24 * 1000), 'ms');
			periodLimitEnd.add(daysChange * (60 * 60 * 24 * 1000), 'ms');

			if(periodLimitEnd.isAfter(periodEnd)) {
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

	onMouseLeave(e) {
		this._drag = false;
		this._lastX = null;

		this.context.updateContext({
			mouseX: null
		});

	}

	/**
	 * Based on the amount of pixels the wheel moves update the size of the visible pixels.
	 * @param e {SyntheticEvent}
	 *
	 */
	onWheel(e) {
		const {period, mouseX,getTime} = this.context;
		e.preventDefault();
		let change;
		let mouseTime = getTime(mouseX);

		// only allow zoom inside data scope
		if (mouseTime.isAfter(period.start) && mouseTime.isBefore(period.end)) {
			if (e.deltaY > 0) {
				// zoom out
				change = 1 - Math.abs(e.deltaY / (10 * 100));
			} else {
				// zoom in
				change = 1 + Math.abs(e.deltaY / (10 * 100));
			}

			let newWidth = this.context.dayWidth * change;

			this.zoom(newWidth);
		}
	}

	zoom(newWidth) {
		const {dayWidth, period, mouseX, minDayWidth, width, maxDayWidth, getTime, updateContext, periodLimit} = this.context;
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


		updateContext({
			periodLimit: {
				start: start,
				end: end
			}
		});
	}

	onPinch(e){
		const {dayWidth, mouseX, minDayWidth, width, getTime, updateContext} = this.context;
		e.preventDefault();
		let change;
		let mouseTime = getTime(mouseX);
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

export default TimelineEventsWrapper;
