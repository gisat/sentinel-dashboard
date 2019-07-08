import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {Context as TimeLineContext} from './context';

import TimelineEventsWrapper from './TimelineEventsWrapper';
import Years from './years';
import Months from './months';
import Days from './days';
import Hours from './hours';
import Minutes from './minutes';
import Picker from './centerPicker';
import Mouse from './mouse';
import Overlays from './overlay';
import PeriodLimit from './periodLimit';

import './style.css';

class TimelineContent extends React.PureComponent {
	static contextType = TimeLineContext;

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
			case 'minute':
				return Minutes;
			default:
				return null;
		}
	}

	render() {
		const {period, initialPeriod, height, width, pickDateByCenter,dayWidth, periodLimit, mouseX, activeLevel, maxDayWidth, overlays, periodLimitVisible} = this.context;
		let content = null;

		const LevelElement = this.getLevelElement(activeLevel);

		return (
				<TimelineEventsWrapper
					width={width}
					maxDayWidth={maxDayWidth}
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
							{periodLimitVisible ? <PeriodLimit period={period} periodLimit={periodLimit} getX={(dayWidth) => this.context.getX(dayWidth)} height={height}/> : null}
							{overlays ? <Overlays overlays={overlays} period={periodLimit} getX={(dayWidth) => this.context.getX(dayWidth)}/> : null}
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
