import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './style.css';


import TimeLineHover from './TimeLineHover';
import HoverHandler from '../HoverHandler/HoverHandler';
import {isInside} from '../../utils/period';

import Picker from '../TimeLine/centerPicker';
import Mouse from '../TimeLine/mouse';
import Overlays from '../TimeLine/overlay';
import PeriodLimit from '../TimeLine/periodLimit';

import Years from '../TimeLine/years';
import Months from '../TimeLine/months';
import Days from '../TimeLine/days';
import Hours from '../TimeLine/hours';
import Minutes from '../TimeLine/minutes';



import Timeline, {LEVELS} from '../TimeLine';

const CONTROLS_WIDTH = 0;
const TOOLTIP_PADDING = 5;
const MOUSE_BUFFER_WIDTH = 5;
const INITIAL_STATE = {
	mouseX: null,
	// displayTooltip: false
};

const LevelElement = (props) => {
	const {activeLevel} = props;
	switch (activeLevel) {
		case 'year':
			return React.createElement(Years, props);
		case 'month':
			return React.createElement(Months, props);
		case 'day':
			return React.createElement(Days, props);
		case 'hour':
			return React.createElement(Hours, props);
		case 'minute':
			return React.createElement(Minutes, props);
		default:
			return React.createElement(Years, props);
	}
}

class MapsTimeline extends React.PureComponent {
	constructor (props) {
		super(props);
		this.onClick = this.onClick.bind(this);
		this.getHoverContent = this.getHoverContent.bind(this);
		this.getTootlipStyle = this.getTootlipStyle.bind(this);
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
			return (<div className={'hover-overlay'} key={o.key}>
						<span className="dot" style={{backgroundColor: o.backdroundColor}}></span>
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
				time: {` ${time.format("YYYY MM D H:mm:ss")}`}
				{overlaysContent}
			</div>
		)
	}

	getTootlipStyle(posX, posY, maxX, maxY, width, height) {
		const {vertical} = this.props;
		if(!vertical) {
			posX = posX - width / 2
	
			// positioning
			if ((posX + width)> (maxX - TOOLTIP_PADDING)) {
				posX = maxX - TOOLTIP_PADDING - (width);
			}
	
			if (posX < TOOLTIP_PADDING) {
				posX = TOOLTIP_PADDING;
			}

			posY = posY + TOOLTIP_PADDING;
		} else {
			//in vertical posX is on Y axes
			//in vertical posY is on X axes
			posY = maxY - posX - height / 2
		
			if ((posY + height)> (maxY - TOOLTIP_PADDING)) {
				posY = maxY - TOOLTIP_PADDING - (height);
			}
	
			if (posY < TOOLTIP_PADDING) {
				posY = TOOLTIP_PADDING;
			}


			posX = 0 - width - TOOLTIP_PADDING;
		}

		return {
			bottom: posY,
			left: posX,
			width
		};
	}

	render() {
		const {activeLevel, time, overlays, LEVELS, containerWidth, containerHeight, dayWidth, period, initialPeriod, vertical} = this.props; // consume unneeded props (though we'll probably use them in the future)

		return (
			<div className={'ptr-timeline-container'}>
				<HoverHandler getStyle={this.getTootlipStyle}>
					<TimeLineHover getHoverContent={this.getHoverContent}>
						<Timeline 
							dayWidth={dayWidth}
							period={period}
							initialPeriod={initialPeriod}
							mouseBufferWidth= {MOUSE_BUFFER_WIDTH}
							pickDateByCenter= {true}
							selectedDate= {null}
							onChange= {(timelineState) => {this.onTimelineChange(timelineState)}}
							activeLevel={activeLevel}
							time={time}
							overlays={overlays}
							LEVELS={LEVELS}
							containerWidth={containerWidth}
							containerHeight={containerHeight}
							onClick= {this.onClick}
							vertical={vertical}
							periodLimit={initialPeriod}
							periodLimitOnCenter={true}
						>
							<PeriodLimit key="periodLimit"/>
							<Overlays overlays={overlays} key="overlays"/>
							<LevelElement key="levelElement"/>
							<Picker key="picker"/>
							<Mouse mouseBufferWidth={20} key="mouse"/>
						</Timeline>
					</TimeLineHover>
				</HoverHandler>				
			</div>
		)
	}

}

export {LEVELS};

export default MapsTimeline;
