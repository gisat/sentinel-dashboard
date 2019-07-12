import React from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import {getMonths, getDays, getHours} from '../utils/interval';
import Label from '../utils/textLabel';
import './style.css';

const DAYWIDTHTRASHOLD = 100;
class Hours extends React.PureComponent {
	static propTypes = {
		period: PropTypes.shape({
			start: PropTypes.object,
			end: PropTypes.object
		}),
		getX: PropTypes.func,
		dayWidth: PropTypes.number,
	};

	render() {
		const {periodLimit, getX, dayWidth, height, vertical, background} = this.props;
		const periodStart = moment(periodLimit.start);
		const periodEnd = moment(periodLimit.end);
		const monthsCfg = getMonths(periodStart, periodEnd);
		const daysCfg = getDays(periodStart, periodEnd);
		const hoursCfg = getHours(periodStart, periodEnd);

		let days = _.map(daysCfg, day => {
			const start = getX(day.start);
			const label = (
				<Label label={day.day} vertical={vertical} x={start} height={height} className={'ptr-timeline-month-label'} />
			);
			
			return (
				<g
					key={`${day.year}-${day.month}-${day.day}`}
					className={classNames("ptr-timeline-month", (+day.start.format('H') % 2) ? 'odd' : 'even')}
				>
					{label}
				</g>
			);
		});

		let hours = _.map(hoursCfg, hour => {
			let start = getX(hour.start);

			let label = null
			if (dayWidth > 900) {
				const transform = vertical ? `rotate(270, ${start + 0.5}, ${height})` : ''
				label = (
					<text
						transform={transform}
						x={start + 3}
						y={height - 2}
						className="ptr-timeline-hour-label"
					>
						{hour.hour}
					</text>
				);
			}

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
						className={classNames("ptr-timeline-hour", {background: background})}
					/>
					{label}
				</g>
			);
		});

		return React.createElement('g', null, (<>{days}{hours}</>));
	}

}

export default Hours;
