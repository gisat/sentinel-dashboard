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
		const {period, initialPeriod, height, width, pickDateByCenter,dayWidth, periodLimit, mouseX, activeLevel, maxDayWidth, overlays, periodLimitVisible, vertical} = this.context;
		let content = null;

		const LevelElement = this.getLevelElement(activeLevel);

		const elementWidth = vertical ? height : width;
		const elementHeight = vertical ? width : height;
		const transform = vertical ? `rotate(90) translate(0,${-height})` : '';
		return (
				<TimelineEventsWrapper>
					<div
						className="ptr-timeline-content"
					>
						{content}
						<svg
							width={elementWidth}
							height={elementHeight}
						>
							<g transform={transform} >
								{periodLimitVisible ? <PeriodLimit period={period} periodLimit={periodLimit} getX={(dayWidth) => this.context.getX(dayWidth)} height={height} vertical/> : null}
								{overlays ? <Overlays overlays={overlays} period={periodLimit} getX={(dayWidth) => this.context.getX(dayWidth)} vertical/> : null}
								<LevelElement
									period={periodLimit}
									getX={(dayWidth) => this.context.getX(dayWidth)}
									height={height}
									dayWidth={dayWidth}
									vertical={vertical}
								/>
								{pickDateByCenter ? <Picker position={width / 2} height={height} vertical/> : null}
								{mouseX ? <Mouse mouseX={mouseX} mouseBufferWidth={20} height={height} vertical/> : null}
							</g>
						</svg>
					</div>
				</TimelineEventsWrapper>
		);
	}

}

export default TimelineContent;
