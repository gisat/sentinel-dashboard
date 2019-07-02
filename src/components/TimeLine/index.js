import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import TimelineEventsWrapper from './TimelineEventsWrapper';
import Years from './years';
import Months from './months';
import Days from './days';
import Hours from './hours';
import Picker from './centerPicker';
import Mouse from './mouse';
// import Days from './Days';
// import Hours from './Hours';

// import Mouse from './Mouse';
// import Picker from './Picker';
// import Layers from './Layers';
// import OutOfScopeOverlays from './OutOfScopeOverlays';

import './style.css';

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
		level: 'days',
	},
	{
		end: 1600,
		level: 'hours',
	}
]

class TimelineContent extends React.PureComponent {

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
		
		onMouseEnter: PropTypes.func,
		onMouseLeave: PropTypes.func,
		onMouseUp: PropTypes.func,
		onMouseMove: PropTypes.func,
		onMouseDown: PropTypes.func,
		onPinch: PropTypes.func,
		
		onChange: PropTypes.func,
	};

	static defaultProps = {
		height: 45,
		dayWidth: 1.5,
		levels: LEVELS,
	}

	constructor(props){
		super(props);
		this.node = React.createRef();

		this.onChange = this.onChange.bind(this);

		this.state = {
			dayWidth:1,
			periodLimit: props.period,
			mouseX: null
		}
	}


	onChange(changed) {

		const dayWidth = changed.dayWidth;
		const dayWidthChanged = dayWidth !== this.state.dayWidth;
		if(dayWidthChanged) {
			this.setState({dayWidth})
		}

		const periodLimit = changed.periodLimit;
		const periodLimitChanged = periodLimit !== this.state.periodLimit;
		if(periodLimitChanged) {
			this.setState({periodLimit})
		}

		const mouseXChanged = changed.mouseX !== this.state.mouseX;
		if(mouseXChanged) {
			this.setState({mouseX: changed.mouseX})
		}
		
		const hasChangeListener = typeof this.props.onChange === 'function';
		if((periodLimitChanged || dayWidthChanged) && hasChangeListener) {
			this.props.onChange(changed);
		}
	}

	getX(date) {
		date = moment(date);
		let diff = date.unix() - moment(this.state.periodLimit.start).unix();
		let diffDays = diff / (60 * 60 * 24);
		return diffDays * this.state.dayWidth;
	}

	getTime(x) {
		let diffDays = x / this.props.dayWidth;
		let diff = diffDays * (60 * 60 * 24 * 1000);
		return moment(this.props.period.start).add(moment.duration(diff, 'ms'));
	}

	//Find first level with smaller start level.
	getActiveLevel(dayWidth, levels) {
		return levels.find((l) => dayWidth <= l.end)
	}

	getLevelElement(levelKey) {
		switch (levelKey) {
			case 'year':
				return Years;
			case 'month':
				return Months;
			case 'days':
				return Days;
			case 'hours':
				return Hours;
			default:
				return null;
		}
	}

	render() {
		const {levels, period, initialPeriod, height, onMouseLeave, onWheel, onMouseDown, onMouseMove, containerWidth, pickDateByCenter} = this.props;
		const {dayWidth, periodLimit, mouseX} = this.state;

		let content = null;

		const lastLevel = levels[levels.length - 1];
		const maxDayWidth = lastLevel.end;
		const activeDayWidth = dayWidth >= maxDayWidth ? maxDayWidth : dayWidth;
		const activeLevel = this.getActiveLevel(activeDayWidth, levels).level;

		const LevelElement = this.getLevelElement(activeLevel);

		return (
			<TimelineEventsWrapper
				width={containerWidth}
				period={period}
				periodLimit={initialPeriod}
				onChange={this.onChange}
				maxDayWidth={maxDayWidth}
				>
				<div
					ref={this.node}
					className="ptr-timeline-content"
					onMouseLeave={onMouseLeave}
					onWheel={onWheel}
					onMouseDown={onMouseDown}
					onMouseUp={onMouseDown}
					onMouseMove={onMouseMove}
				>
					{content}
					<svg
						width={containerWidth}
						height={height}
					>
						<LevelElement
							period={periodLimit}
							getX={(dayWidth) => this.getX(dayWidth)}
							height={height}
							dayWidth={activeDayWidth}
						/>
						{pickDateByCenter ? <Picker position={containerWidth / 2} height={height}/> : null}
						{mouseX ? <Mouse mouseX={mouseX} mouseBufferWidth={20} height={height} /> : null}
					</svg>
				</div>
			</TimelineEventsWrapper>
		);
	}

}

export default TimelineContent;
