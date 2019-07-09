import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Timeline, {LEVELS} from '../TimeLine';

const CONTROLS_WIDTH = 0;
const MOUSE_BUFFER_WIDTH = 5;
const INITIAL_STATE = {
	mouseX: null,
	// displayTooltip: false
};

class MapsTimeline extends React.PureComponent {
	constructor (props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

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
		onTimeClick: PropTypes.func,
		// activeLayers: //for tooltip
		// initialize: PropTypes.func
	};

	onClick(evt) {
		switch (evt.type) {
			case 'time':
				if(typeof this.props.onTimeClick === 'function') {
					this.props.onTimeClick(evt);
				}
				break;
			default:
				if(typeof this.props.onClick === 'function') {
					this.props.onClick(evt);
				}
				break;
		}
	}

	onTimelineChange(timelineState) {
		if(typeof this.props.onChange === 'function') {
			this.props.onChange(timelineState);
		}
	}

	render() {

		const children = [];

		const {maps, activeMapKey, activeLevel, time, overlays, LEVELS, containerWidth, onTimeClick} = this.props; // consume unneeded props (though we'll probably use them in the future)
		const contentProps = {
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
			overlays,
			LEVELS,
			containerWidth, 
			onClick: this.onClick,
		};
		children.push(React.createElement(Timeline, contentProps));
		return React.createElement('div', {className: 'ptr-timeline-container'}, children);
	}

}

export {LEVELS};

export default MapsTimeline;
