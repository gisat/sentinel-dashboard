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
		end: 2500,
		level: 'hour',
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

		// this.onChange = this.onChange.bind(this);

		this.state = {
			dayWidth: props.dayWidth,
			period: props.period,
			periodLimit: props.periodLimit || props.period,
			centerTime:null
		}

		this.updateContext = this.updateContext.bind(this);
		this.getX = this.getX.bind(this);
		this.getTime = this.getTime.bind(this);
		this.getActiveLevel = this.getActiveLevel.bind(this);
	}

	getX(date) {
		date = moment(date);
		let diff = date.unix() - moment(this.state.periodLimit.start).unix();
		let diffDays = diff / (60 * 60 * 24);
		return diffDays * this.state.dayWidth;
	}

	getTime(x) {
		let diffDays = x / this.state.dayWidth;
		let diff = diffDays * (60 * 60 * 24 * 1000);
		return moment(this.state.periodLimit.start).add(moment.duration(diff, 'ms'));
	}

	//Find first level with smaller start level.
	getActiveLevel(dayWidth) {
		return this.props.levels.find((l) => dayWidth <= l.end)
	}


	getDayWidthForPeriod(period, containerWidth) {
		const start = moment(period.start);
		const end = moment(period.end);

		const diff = end.diff(start, 'ms');
		const diffDays = diff / (60 * 60 * 24 * 1000);

		const dayWidth = (containerWidth - CONTROLS_WIDTH) / diffDays;
		
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
			
			//on change dayWidth calculate periodLimit
			if(options.dayWidth) {
				options.periodLimit = this.getPeriodLimitByDayWidth()
			}
			
			//on change periodLimit calculate dayWidth
			if(options.periodLimit) {
				options.dayWidth = this.getDayWidthForPeriod(options.periodLimit, this.props.containerWidth);
			}

			if(options.dayWidth) {
				options.activeLevel = this.getActiveLevel(options.dayWidth, this.props.levels).level;
			}
			
			this.setState({...options}, () => {
				let centerTime = this.getTime(this.props.containerWidth / 2);
				this.setState({centerTime}, () => {
					if(typeof this.props.onChange === 'function') {
						this.props.onChange(this.state);
					}
				})
			});
		}
	}

	render() {
		const {levels, period, height, containerWidth, pickDateByCenter} = this.props;
		const {dayWidth, periodLimit, mouseX} = this.state;

		const lastLevel = levels[levels.length - 1];
		const maxDayWidth = lastLevel.end;
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
