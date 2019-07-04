import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {ContextProvider} from './context';
import TimelineContent from './timelineContent';

const CONTROLS_WIDTH = 0;

const LEVELS = [
	{
		end: 1,
		level: 'year',
	},
	{
		end: 20,
		level: 'month',
	},
	{
		end: 200,
		level: 'day',
	},
	{
		end: 7000,
		level: 'hour',
	},
	{
		end: 70000,
		level: 'minute',
	}
]

class Timeline extends React.PureComponent {

	static propTypes = {
		period: PropTypes.shape({
			start: PropTypes.object,
			end: PropTypes.object
		}),
		initialPeriod: PropTypes.shape({
			start: PropTypes.object,
			end: PropTypes.object
		}),
		dayWidth: PropTypes.number,
		height: PropTypes.number,
		containerWidth: PropTypes.number,
		onWheel: PropTypes.func,
		getX: PropTypes.func,

		pickDateByCenter: PropTypes.bool,
		selectedDate: PropTypes.object,
		
		levels: PropTypes.arrayOf(PropTypes.shape({
			end: PropTypes.number,
			level: PropTypes.string
		})),												//ordered levels by higher level.end 
		
		onChange: PropTypes.func,
	};

	static defaultProps = {
		height: 45,
		dayWidth: 1.5,
		levels: LEVELS,
	}

	constructor(props){
		super(props);

		this.updateContext = this.updateContext.bind(this);
		this.getX = this.getX.bind(this);
		this.getTime = this.getTime.bind(this);
		this.getActiveLevel = this.getActiveLevel.bind(this);


		const state = this.getStateUpdate({
			period: props.period,
			periodLimit: props.periodLimit || props.period,
			centerTime: props.time,
		})

		this.state = state;

		if(typeof this.props.onChange === 'function') {
			this.props.onChange(this.state)
		}

		// this.state={dayWidth:1,period:props.period,periodLimit: props.periodLimit || props.period}

	}

	componentDidUpdate(prevProps) {
		//if parent component set activeLevel
		if(prevProps.activeLevel !== this.props.activeLevel && this.state.activeLevel !== this.props.activeLevel) {
			const level = this.props.levels.find((l) => this.props.activeLevel === l.level);
			
			//zoom to dayWidth
			this.updateContext({dayWidth: level.end - 0.1})
		}
	
		//if parent component set time
		if(prevProps.time !== this.props.time && this.state.centerTime !== this.props.time) {
			

			const periodLimit = this.getPeriodLimitByTime(this.props.time);
			
			//zoom to dayWidth
			this.updateContext({periodLimit})
		}
	}

	getPeriodLimitByTime(time, containerWidth = this.props.containerWidth, period = this.state.period, dayWidth = this.state.dayWidth) {
		const allDays = containerWidth / dayWidth;
		let setTime = moment(time);

		//check if setTime is in period
		if (setTime.isBefore(period.start)){
			setTime = period.start
		}

		if (setTime.isAfter(period.end)){
			setTime = period.end
		}

		const halfDays = allDays / 2;
		const start = moment(setTime).subtract(moment.duration(halfDays * (60 * 60 * 24 * 1000), 'ms'));
		const end = moment(setTime).add(moment.duration(halfDays * (60 * 60 * 24 * 1000), 'ms'));
		return {
			start,
			end
		}
	}

	getX(date) {
		date = moment(date);
		let diff = date.unix() - moment(this.state.periodLimit.start).unix();
		let diffDays = diff / (60 * 60 * 24);
		return diffDays * this.state.dayWidth;
	}

	getTime(x, dayWidth = this.state.dayWidth, startTime = this.state.periodLimit.start) {
		let diffDays = x / dayWidth;
		let diff = diffDays * (60 * 60 * 24 * 1000);
		return moment(startTime).add(moment.duration(diff, 'ms'));
	}

	//Find first level with smaller start level.
	getActiveLevel(dayWidth) {
		return this.props.levels.find((l) => dayWidth <= l.end)
	}


	getDayWidthForPeriod(period, containerWidth, maxDayWidth = this.getMaxDayWidth()) {
		const start = moment(period.start);
		const end = moment(period.end);

		const diff = end.diff(start, 'ms');
		const diffDays = diff / (60 * 60 * 24 * 1000);

		let dayWidth = (containerWidth - CONTROLS_WIDTH) / diffDays;
		if(dayWidth > maxDayWidth) {
			dayWidth = maxDayWidth;
		}

		return dayWidth;
	}

	getPeriodLimitByDayWidth(dayWidth) {
		const {containerWidth} = this.props;
		const {centerTime} = this.state;

		const allDays = containerWidth / dayWidth;
		const halfMouseDays = allDays / 2;

		const start = moment(centerTime).subtract(moment.duration(halfMouseDays * (60 * 60 * 24 * 1000), 'ms'));
		const end = moment(centerTime).add(moment.duration(halfMouseDays * (60 * 60 * 24 * 1000), 'ms'));
		return {
			start,
			end
		}
	}

	updateContext(options) {
		if (options) {
			const stateUpdate = this.getStateUpdate(options);
			this.setState(stateUpdate, () => {
				if(typeof this.props.onChange === 'function') {
					this.props.onChange(this.state);
				}
			})
		}
	}

	getStateUpdate(options) {	
		if (options) {
			const updateContext = {};
			Object.assign(updateContext, {...options});
			
			//on change dayWidth calculate periodLimit
			if(options.dayWidth) {
				Object.assign(updateContext, {periodLimit: this.getPeriodLimitByDayWidth(options.dayWidth)})
			}
			
			//on change periodLimit calculate dayWidth
			if(options.periodLimit) {
				Object.assign(updateContext, {dayWidth: this.getDayWidthForPeriod(options.periodLimit, this.props.containerWidth)})
			}

			if(updateContext.dayWidth) {
				Object.assign(updateContext, {activeLevel: this.getActiveLevel(updateContext.dayWidth, this.props.levels).level})
			}

			if(updateContext.dayWidth && !options.centerTime) {
				Object.assign(updateContext, {centerTime: this.getTime(this.props.containerWidth / 2, updateContext.dayWidth, updateContext.periodLimit.start).toDate()})
			}

			if(options.centerTime) {
				Object.assign(updateContext, {periodLimit: this.getPeriodLimitByTime(options.centerTime, this.props.containerWidth, this.props.period, updateContext.dayWidth)})
			}
			
			return updateContext
		} else {
			return {};
		}
	}

	getMaxDayWidth(levels = this.props.levels) {
		const lastLevel = levels[levels.length - 1];
		const maxDayWidth = lastLevel.end;
		return maxDayWidth;
	}

	render() {
		const {levels, period, height, containerWidth, pickDateByCenter} = this.props;
		const {dayWidth, periodLimit, mouseX} = this.state;

		const maxDayWidth = this.getMaxDayWidth();
		const activeDayWidth = dayWidth >= maxDayWidth ? maxDayWidth : dayWidth;
		const activeLevel = this.getActiveLevel(activeDayWidth, levels).level;
		const minDayWidth = this.getDayWidthForPeriod(period,containerWidth)

		return (
			<ContextProvider value={{
				updateContext: this.updateContext,
				width: containerWidth,
				height,
				getX: this.getX,
				getTime: this.getTime,
				centerTime: this.state.centerTime,
				getActiveLevel: this.getActiveLevel,
				dayWidth,
				maxDayWidth,
				minDayWidth,
				period,
				periodLimit,
				mouseX,
				activeLevel,
				pickDateByCenter,
				}}>
				<TimelineContent />
			</ContextProvider>
		);
	}

}

export default Timeline;
