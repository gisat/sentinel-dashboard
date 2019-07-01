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
		// activeLayers: //for tooltip
		// initialize: PropTypes.func
	};

	constructor(props) {
		super();
		this.state = {...INITIAL_STATE};

		this.calculate = this.calculate.bind(this);
		this.getTime = this.getTime.bind(this);
		this.calculate(props);

		this.state = {
			period: {
				start: props.initialPeriod.start,
				end: props.initialPeriod.end
			},
			periodLimit: {
				start: props.initialPeriod.start,
				end: props.initialPeriod.end
			},
			dayWidth: this.dimensions.dayWidth
		};
	}

	componentDidMount() {
		this.dispatchChange();
	}
	componentDidUpdate(nextProps) {
		if (nextProps.containerWidth !== this.props.containerWidth) {
			this.calculate(nextProps);
		}
	}

	dispatchChange() {
		if(typeof this.props.onChange === 'function') {
			let centerTime = this.getTime(this.dimensions.width / 2);
			this.props.onChange({...this.state, centerTime});
		}
	}

	handleChange(change) {
		this.setState((state) => change, this.dispatchChange)
	}

	calculate(props) {
		let start = moment(props.initialPeriod.start);
		let end = moment(props.initialPeriod.end);

		let diff = end.diff(start, 'ms');
		let diffDays = diff / (60 * 60 * 24 * 1000);

		this.dimensions = {
			width: props.containerWidth - CONTROLS_WIDTH,
			days: diffDays,
			dayWidth: (props.containerWidth - CONTROLS_WIDTH)/diffDays
		};

		if (this.state.dayWidth) { // don't set state in constructor
			this.handleChange({
				dayWidth: this.dimensions.dayWidth
			});
		}
	}

	getTime(x, props) {
		let diffDays = x / this.state.dayWidth;
		let diff = diffDays * (60 * 60 * 24 * 1000);
		return moment(this.state.period.start).add(moment.duration(diff, 'ms'));
	}

	render() {

		let children = [];

		let {maps, activeMapKey, ...contentProps} = this.props; // consume unneeded props (though we'll probably use them in the future)
		contentProps = {...contentProps,
			key: 'mapsTimelineContent',
			dayWidth: this.state.dayWidth,
			period: this.state.period,
			initialPeriod: this.props.initialPeriod,
			mouseX: this.state.mouseX,
			mouseBufferWidth: MOUSE_BUFFER_WIDTH,

			pickDateByCenter: true,
			selectedDate: null
		};
		children.push(React.createElement(TimelineContent, contentProps));
		return React.createElement('div', {className: 'ptr-timeline-container'}, children);
	}

}

export default MapsTimeline;
