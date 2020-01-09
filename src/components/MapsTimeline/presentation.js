import React from 'react';
import PropTypes from 'prop-types';
import './style.css';


import TimeLineHover from '../TimeLine/TimeLineHover';
import HoverHandler from '../HoverHandler/HoverHandler';
import {getTootlipPosition} from "../HoverHandler/position";
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
import Timeline from '../TimeLine';

const TOOLTIP_PADDING = 5;
const MOUSE_BUFFER_WIDTH = 5;

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
		this.getTooltipStyle = this.getTooltipStyle.bind(this);
	}

	static propTypes = {
		period: PropTypes.shape({
			start: PropTypes.string,
			end: PropTypes.string
		}).isRequired,
		initialPeriod: PropTypes.shape({
			start: PropTypes.string,
			end: PropTypes.string
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

	getTooltipStyle() {
		const referencePoint = 'center';
		return () => {
			const windowScrollTop = window.document.documentElement.scrollTop;
			const windowScrollLeft = window.document.documentElement.scrollLeft;
			const windowHeight = window.document.documentElement.clientHeight;
			const windowWidth = window.document.documentElement.clientWidth;
			const windowBBox = [windowScrollTop, windowScrollLeft + windowWidth, windowScrollTop + windowHeight, windowScrollLeft];
			return getTootlipPosition(referencePoint, ['left', 'top', 'right', 'bottom'], windowBBox, TOOLTIP_PADDING)
		}
	}

	render() {
		const {activeLevel, time, overlays, LEVELS, containerWidth, containerHeight, dayWidth, period, initialPeriod, vertical} = this.props; // consume unneeded props (though we'll probably use them in the future)

		return (
			<div className={'ptr-timeline-container'}>
				<HoverHandler getStyle={this.getTooltipStyle()}>
					<TimeLineHover getHoverContent={this.getHoverContent}>
						<Timeline 
							dayWidth={dayWidth}
							periodLimit={period}
							mouseBufferWidth= {MOUSE_BUFFER_WIDTH}
							selectedDate= {null}
							onChange= {(timelineState) => {this.onTimelineChange(timelineState)}}
							activeLevel={activeLevel}
							time={time}
							LEVELS={LEVELS}
							containerWidth={containerWidth}
							containerHeight={containerHeight}
							onClick= {this.onClick}
							vertical={vertical}
							period={initialPeriod}
							periodLimitOnCenter={true}
							selectMode={false}
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

export default MapsTimeline;
