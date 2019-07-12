import React from 'react';
import PropTypes from 'prop-types';

import {Context as TimeLineContext} from './context';

import TimelineEventsWrapper from './TimelineEventsWrapper';

import './style.css';

class TimelineContent extends React.PureComponent {
	static contextType = TimeLineContext;

	render() {
		const {period, height, width,dayWidth, periodLimit, mouseX, vertical} = this.context;
		const {children} = this.props;
		let content = null;

		const elementWidth = vertical ? height : width;
		const elementHeight = vertical ? width : height;
		const transform = vertical ? `scale(-1,1)` : '';

		const childrenWithProps = [];
		if(children && children.length > 0) {
			children.forEach(child => {
				const {children, ...propsWithoutChildren} = this.props;
	
				childrenWithProps.push(React.cloneElement(child, {
					...propsWithoutChildren,
					periodLimit: periodLimit,
					period: period,
					getX: (dayWidth) => this.context.getX(dayWidth),
					height: height,
					width: width,
					dayWidth: dayWidth,
					vertical: vertical,
					mouseX: mouseX
				}))
			})
		}

		return (
				<TimelineEventsWrapper>
					<div className="ptr-timeline-content">
						{content}
						<svg
							width={elementWidth}
							height={elementHeight}
							transform={transform}
							>
							<g>
								{childrenWithProps}
							</g>
						</svg>
					</div>
				</TimelineEventsWrapper>
		);
	}

}

export default TimelineContent;
