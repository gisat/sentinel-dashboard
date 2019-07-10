import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './style.css';


import TimeLineHover from './TimeLineHover';
import HoverHandler from '../HoverHandler/HoverHandler';
import {isInside} from '../../utils/period';

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
		this.getHoverContent = this.getHoverContent.bind(this);
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
		containerHeight: PropTypes.number,
		onChange: PropTypes.func,
		activeLevel: PropTypes.string,
		onTimeClick: PropTypes.func,
		vertical: PropTypes.bool,
	};

	onClick(evt) {
		const {onTimeClick, onClick} = this.props
		switch (evt.type) {
			case 'time':
				if(typeof onTimeClick === 'function') {
					onTimeClick(evt);
				}
				break;
			default:
				if(typeof onClick === 'function') {
					onClick(evt);
				}
				break;
		}
	}

	onTimelineChange(timelineState) {
		if(typeof this.props.onChange === 'function') {
			this.props.onChange(timelineState);
		}
	}

	getOverlaysContent(x, time) {
		const {overlays} = this.props;

		const content = []
		const hoveredOverlays = overlays.filter(o => isInside(o, time));
		const hoveredOverlaysContent = hoveredOverlays.map(o => {
			return (<div className={'hover-overlay'}>
						<span class="dot" style={{backgroundColor: o.backdroundColor}}></span>
						<span>{o.label}</span>
					</div>)
		})

		content.push(...hoveredOverlaysContent);
		return content;
	}

	getHoverContent(x, time) {
		const overlaysContent = this.getOverlaysContent(x, time);
		return (
			<div>
				time: {time.toString()}
				{overlaysContent}
			</div>
		)
	}

	render() {
		const children = [];
		const {activeLevel, time, overlays, LEVELS, containerWidth, containerHeight, dayWidth, period, initialPeriod, vertical} = this.props; // consume unneeded props (though we'll probably use them in the future)
		const contentProps = {
			key: 'mapsTimelineContent',
			dayWidth,
			period,
			initialPeriod,
			mouseBufferWidth: MOUSE_BUFFER_WIDTH,

			pickDateByCenter: true,
			selectedDate: null,
			onChange: (timelineState) => {this.onTimelineChange(timelineState)},
			activeLevel,
			time,
			overlays,
			LEVELS,
			containerWidth,
			containerHeight,
			onClick: this.onClick,
			vertical,
		};
		children.push(React.createElement(Timeline, contentProps));

		return (
			<div className={'ptr-timeline-container'}>
				<HoverHandler>
					<TimeLineHover getHoverContent={this.getHoverContent}>
						{children}
					</TimeLineHover>
				</HoverHandler>				
			</div>
		)
	}

}

export {LEVELS};

export default MapsTimeline;
