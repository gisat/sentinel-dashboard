import React from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import {getMonths, getDays, getHours, getMinutes} from '../utils/interval';
import './style.css';

class Hours extends React.PureComponent {
	static propTypes = {
		periodLimit: PropTypes.shape({
			start: PropTypes.object,
			end: PropTypes.object
		}),
		getX: PropTypes.func,
		dayWidth: PropTypes.number,
	};

	render() {
		const {periodLimit, getX, dayWidth, height} = this.props;
		const periodStart = moment(periodLimit.start);
		const periodEnd = moment(periodLimit.end);
		const monthsCfg = getMonths(periodStart, periodEnd);
		const daysCfg = getDays(periodStart, periodEnd);
		const hoursCfg = getHours(periodStart, periodEnd);
		const minutesCfg = getMinutes(periodStart, periodEnd);

		// const months = _.map(monthsCfg, month => {
		// 	const start = getX(month.start);
		// 	const label = (
		// 		<text
		// 			x={start + 3}
		// 			y={height - 2}
		// 			className="ptr-timeline-month-label"
		// 		>
		// 			{month.month}
		// 		</text>
		// 	);

		// 	return (
		// 		<g
		// 			key={month.month}
		// 			className={classNames("ptr-timeline-month", (+month.start.format('M') % 2) ? 'odd' : 'even')}
		// 		>
		// 			{label}
		// 		</g>
		// 	);
		// });

		let days = _.map(daysCfg, day => {
			

			const start = getX(day.start);
			const label = (
				<text
					x={start + 3}
					y={height - 2}
					className="ptr-timeline-month-label"
				>
					{day.day}
				</text>
			);
			
			return (
				<g
					key={day.day}
					className={classNames("ptr-timeline-month", (+day.start.format('H') % 2) ? 'odd' : 'even')}
				>
					{label}
				</g>
			);
		});

		let hours = _.map(hoursCfg, hour => {
			let start = this.props.getX(hour.start);
			// let end = this.props.getX(day.end);
			// let monday = hour.start.format('dddd') === 'Monday';
			let height = this.props.height;
			if (!this.props.background) {
				height = height - 20
			}

			let label = null
			// if (this.props.dayWidth > 900) {
			// 	label = (
			// 		<text
			// 			x={start + 3}
			// 			y={height - 2}
			// 			className="ptr-timeline-hour-label"
			// 		>
			// 			{hour.hour}
			// 		</text>
			// 	);
			// }

			return (
				<g
				key={`${hour.year}-${hour.month}-${hour.day}-${hour.hour}`}
				className={classNames("ptr-timeline-hour")}
				>
					<line
						key={`${hour.start.toISOString()}+${hour.hour}`}
						x1={start + 0.5}
						x2={start + 0.5}
						y1={0}
						y2={height}
						className={classNames("ptr-timeline-hour", {background: this.props.background})}
					/>
					{label}
				</g>
			);
		});

		let minutes = _.map(minutesCfg, minute => {
			let start = this.props.getX(minute.start);
			let height = this.props.height;
			if (!this.props.background) {
				height = height - 20
			}

			let label = null
			if (this.props.dayWidth > 2500) {
				label = (
					<text
						x={start + 3}
						y={height - 2}
						className="ptr-timeline-minute-label"
					>
						{minute.minute}
					</text>
				);
			}

			return (
				<g
				key={`${minute.year}-${minute.month}-${minute.day}-${minute.hour}-${minute.minute}`}
				className={classNames("ptr-timeline-minute")}
				>
					<line
						key={`${minute.start.toISOString()}+${minute.minute}`}
						x1={start + 0.5}
						x2={start + 0.5}
						y1={0}
						y2={height}
						className={classNames("ptr-timeline-minute", {background: this.props.background})}
					/>
					{label}
				</g>
			);
		})

		return React.createElement('g', null, (<>{days}{hours}{minutes}</>));
	}

}

export default Hours;
