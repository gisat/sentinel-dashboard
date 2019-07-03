import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {Context as TimeLineContext} from './context';

import TimelineEventsWrapper from './TimelineEventsWrapper';
import Years from './years';
import Months from './months';
import Days from './days';
import Hours from './hours';
import Picker from './centerPicker';
import Mouse from './mouse';

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
		level: 'day',
	},
	{
		end: 2500,
		level: 'hour',
	}
]

class TimelineContent extends React.PureComponent {
	static contextType = TimeLineContext;

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

	getLevelElement(levelKey) {
		switch (levelKey) {
			case 'year':
				return Years;
			case 'month':
				return Months;
			case 'day':
				return Days;
			case 'hour':
				return Hours;
			default:
				return null;
		}
	}

	render() {
		const {period, initialPeriod, height, width, pickDateByCenter,dayWidth, periodLimit, mouseX, activeLevel} = this.context;
		let content = null;

		const LevelElement = this.getLevelElement(activeLevel);

		return (
				<TimelineEventsWrapper
					width={width}
					period={period}
					periodLimit={initialPeriod}
					onChange={this.onChange}
					>
					<div
						className="ptr-timeline-content"
					>
						{content}
						<svg
							width={width}
							height={height}
						>
							<LevelElement
								period={periodLimit}
								getX={(dayWidth) => this.context.getX(dayWidth)}
								height={height}
								dayWidth={dayWidth}
							/>
							{pickDateByCenter ? <Picker position={width / 2} height={height}/> : null}
							{mouseX ? <Mouse mouseX={mouseX} mouseBufferWidth={20} height={height} /> : null}
						</svg>
					</div>
				</TimelineEventsWrapper>
		);
	}

}

export default TimelineContent;
