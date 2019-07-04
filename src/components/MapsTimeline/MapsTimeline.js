import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import TimelineContent from '../TimeLine';

const CONTROLS_WIDTH = 0;
const MOUSE_BUFFER_WIDTH = 5;
const INITIAL_STATE = {
	mouseX: null,
	// displayTooltip: false
};

class MapsTimeline extends React.PureComponent {

	static propTypes = {
		period: PropTypes.shape({
			start: PropTypes.object,
			end: PropTypes.object
		}).isRequired,
		initialPeriod: PropTypes.shape({
			start: PropTypes.object,
			end: PropTypes.object
		}).isRequired,
		dayWidth: PropTypes.number, //1.5
		// layers: , //for tooltip
		containerWidth: PropTypes.number,
		onChange: PropTypes.func,
		activeLevel: PropTypes.string,
		// activeLayers: //for tooltip
		// initialize: PropTypes.func
	};

	onTimelineChange(timelineState) {
		if(typeof this.props.onChange === 'function') {
			this.props.onChange(timelineState);
		}
	}

	render() {

		let children = [];

		let {maps, activeMapKey, activeLevel, time, ...contentProps} = this.props; // consume unneeded props (though we'll probably use them in the future)
		contentProps = {...contentProps,
			key: 'mapsTimelineContent',
			dayWidth: this.props.dayWidth,
			period: this.props.period,
			initialPeriod: this.props.initialPeriod,
			mouseBufferWidth: MOUSE_BUFFER_WIDTH,

			pickDateByCenter: true,
			selectedDate: null,
			onChange: (timelineState) => {this.onTimelineChange(timelineState)},
			activeLevel,
			time,
		};
		children.push(React.createElement(TimelineContent, contentProps));
		return React.createElement('div', {className: 'ptr-timeline-container'}, children);
	}

}

export default MapsTimeline;
