import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const INITIAL_STATE = {
	minDayWidth: null,
	dayWidth: null,
	dimensions: null,
	period: {start:null, end:null}, //time period whereis possible move
	periodLimit: null, //current time period visible on timeline
	// displayTooltip: false
};

const CONTROLS_WIDTH = 0;

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

	static propTypes = {
		// period: PropTypes.shape({
		// 	start: PropTypes.object,
		// 	end: PropTypes.object
		// }),
		
		maxDayWidth: PropTypes.number,
		dayWidth: PropTypes.number,
		period: PropTypes.shape({ //time period whereis possible move
			start: PropTypes.object,
			end: PropTypes.object
		}),

		periodLimit: PropTypes.shape({ //current time period visible on timeline
			start: PropTypes.object,
			end: PropTypes.object
		}),


		
		// height: PropTypes.number,
		// width: PropTypes.number,

		onChange: PropTypes.func,

		onWheel: PropTypes.func,
		onMouseEnter: PropTypes.func,
		onMouseLeave: PropTypes.func,
		onMouseUp: PropTypes.func,
		onMouseDown: PropTypes.func,
		onPinch: PropTypes.func,
	};

	static defaultProps = {}

	constructor(props){
		super(props);
		const periodLimit = props.periodLimit || props.period;
		const minDayWidth = this.getDayWidthForPeriod(periodLimit, props.width);
		this.state = {...INITIAL_STATE, 
				period: {
					start: props.period.start,
					end: props.period.end
				},
				periodLimit,
				minDayWidth,
				dayWidth: minDayWidth,
			};
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

		// // this.onMouseEnter = this.onMouseEnter.bind(this);
	}

	componentDidUpdate(props, prevProps) {
		const widthChanged = props.width !== prevProps.width;
		const periodChanged = props.period && props.period.start && prevProps.period && prevProps.period.start && moment().isSame(props.period.start, prevProps.period.start);
		if(widthChanged || periodChanged) {
			const minDayWidth = this.getDayWidthForPeriod(props.period, props.width);
			this.handleChange({minDayWidth});
		}
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


	dispatchChange() {
		if(typeof this.props.onChange === 'function') {
			let centerTime = this.getTime(this.props.width / 2);
			this.props.onChange({
				dayWidth: this.state.dayWidth,
				periodLimit: this.state.periodLimit,
				centerTime});
		}
	}
	handleChange(change) {
		this.setState((state) => change, this.dispatchChange)
	}

	getDayWidthForPeriod(period, containerWidth) {
		let start = moment(period.start);
		let end = moment(period.end);

		let diff = end.diff(start, 'ms');
		let diffDays = diff / (60 * 60 * 24 * 1000);

		const dayWidth = (containerWidth - CONTROLS_WIDTH)/diffDays;
		return dayWidth;
	}

	getTime(x) {
		let diffDays = x / this.state.dayWidth;
		let diff = diffDays * (60 * 60 * 24 * 1000);
		return moment(this.state.periodLimit.start).add(moment.duration(diff, 'ms'));
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
		
		this.handleChange({
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
		const {dayWidth} = this.state;
		const periodStart = moment(this.state.period.start);
    	const periodEnd = moment(this.state.period.end);
		let periodLimitStart =  moment(this.state.periodLimit.start)
		let periodLimitEnd = moment(this.state.periodLimit.end)

    // Either add  to start and end.
		let daysChange = Math.abs(dragInfo.distance) / dayWidth;
		if(dragInfo.direction === 'past') {
			periodLimitStart.subtract(daysChange * (60 * 60 * 24 * 1000), 'ms');
	    	periodLimitEnd.subtract(daysChange * (60 * 60 * 24 * 1000), 'ms');
			
			if(periodLimitStart.isBefore(periodStart)) {
				//use last period limit
				periodLimitStart = moment(this.state.periodLimit.start);
				periodLimitEnd = moment(this.state.periodLimit.end);
			}
		} else {
			periodLimitStart.add(daysChange * (60 * 60 * 24 * 1000), 'ms');
			periodLimitEnd.add(daysChange * (60 * 60 * 24 * 1000), 'ms');

			if(periodLimitEnd.isAfter(periodEnd)) {
				//use last period limit
				periodLimitStart = moment(this.state.periodLimit.start);
				periodLimitEnd = moment(this.state.periodLimit.end);
			}
		}

		let widthOfTimeline = this.props.width;
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

		this.handleChange({
			periodLimit: {
				end: periodLimitEnd,
				start: periodLimitStart
			}
		});
	}

	onMouseLeave(e) {
		this._drag = false;
		this._lastX = null;

		this.handleChange({
			mouseX: null
		});

	}

	/**
	 * Based on the amount of pixels the wheel moves update the size of the visible pixels.
	 * @param e {SyntheticEvent}
	 *
	 */
	onWheel(e) {
		e.preventDefault();
		let change;
		let mouseTime = this.getTime(this.state.mouseX);
		// console.log(mouseTime);
		

		// only allow zoom inside data scope
		if (mouseTime.isAfter(this.state.period.start) && mouseTime.isBefore(this.state.period.end)) {
			if (e.deltaY > 0) {
				// zoom out
				change = 1 - Math.abs(e.deltaY / (10 * 100));
			} else {
				// zoom in
				change = 1 + Math.abs(e.deltaY / (10 * 100));
			}

			let newWidth = this.state.dayWidth * change;

			if(newWidth > this.props.maxDayWidth) {
				newWidth = this.props.maxDayWidth;
			}

			//don't allow zoom out outside initial zoom
			if (newWidth < this.state.minDayWidth) {
				newWidth = this.state.minDayWidth;
			}

			let beforeMouseDays = this.state.mouseX / newWidth;
			// let afterMouseDays = (this.props.containerWidth - this.state.mouseX) / newWidth;
			let allDays = this.props.width / newWidth;

			let start = moment(mouseTime).subtract(moment.duration(beforeMouseDays * (60 * 60 * 24 * 1000), 'ms'));
			//let end = moment(mouseTime).add(moment.duration(afterMouseDays, 'days));
			let end = moment(start).add(moment.duration(allDays * (60 * 60 * 24 * 1000), 'ms'));

			this.handleChange({
				dayWidth: newWidth,
				periodLimit: {
					start: start,
					end: end
				}
			});

		}
	}

	onPinch(e){
		e.preventDefault();
		let change;
		let mouseTime = this.getTime(this.state.mouseX);
		if (e.scale > 1) {
			// zoom out
			change = 1 + e.scale / 10;
		} else {
			// zoom in
			change = 1 - e.scale / 10;
		}

		let newWidth = this.state.dayWidth * change;

		//don't allow zoom out outside initial zoom
		if (newWidth < this.state.minDayWidth) {
			newWidth = this.state.minDayWidth;
		}

		let beforeMouseDays = this.state.mouseX / newWidth;
		// let afterMouseDays = (this.props.containerWidth - this.state.mouseX) / newWidth;
		let allDays = this.props.width / newWidth;

		let start = moment(mouseTime).subtract(moment.duration(beforeMouseDays * (60 * 60 * 24 * 1000), 'ms'));
		//let end = moment(mouseTime).add(moment.duration(afterMouseDays, 'days));
		let end = moment(start).add(moment.duration(allDays * (60 * 60 * 24 * 1000), 'ms'));

		this.handleChange({
			dayWidth: newWidth,
			periodLimit: {
				start: start,
				end: end
			}
		});

	}

	render() {
		// const {dayWidth, levels, period, height, onMouseLeave, onMouseEnter, onWheel, onMouseDown, onMouseMove, width, children} = this.props;
		const {children} = this.props;
		const {periodLimit, dayWidth} = this.state;
		//console.log(dayWidth);
		
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
