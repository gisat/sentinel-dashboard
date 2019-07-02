import React from 'react';
import PropTypes from 'prop-types';
import {getYears, getMonths} from '../utils/interval';

import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import './style.css';

class Months extends React.PureComponent {

	static propTypes = {
		period: PropTypes.shape({
			start: PropTypes.object,
			end: PropTypes.object
		}),
		getX: PropTypes.func,
		dayWidth: PropTypes.number,
		height: PropTypes.number,
	};

	render() {
		const {period, getX, dayWidth, height} = this.props;
		const periodStart = moment(period.start);
		const periodEnd = moment(period.end);
		const monthsCfg = getMonths(periodStart, periodEnd);

		const yearsCfg = getYears(periodStart, periodEnd);
		
		const years = _.map(yearsCfg, year => {
			let start = this.props.getX(year.start);
			const label = (
				<text
					x={start + 3}
					y={this.props.height - 2}
					className="ptr-timeline-year-label"
				>
					{year.year}
				</text>
			);
			return (
				<g
					key={year.year}
					className={classNames("ptr-timeline-year", {background: this.props.background})}
				>
					<line
						x1={start + 0.5}
						x2={start + 0.5}
						y1={0}
						y2={this.props.height}
					/>
					{label}
				</g>
			);
		});

		const months = _.map(monthsCfg, month => {
			const start = getX(month.start);
			const end = getX(month.end);
			const label = (
				<text
					x={start + 3}
					y={height - 2}
					className="ptr-timeline-month-label"
				>
					{month.month}
				</text>
			);
			return (
				<g
					key={`${month.year}-${month.month}`}
					className={classNames("ptr-timeline-month", (+month.start.format('M') % 2) ? 'odd' : 'even')}
				>
					<rect
						x={start}
						width={end-start}
						y={0}
						height={height}
					/>
					{label}
				</g>
			);
		});

		return React.createElement('g', null, (<>{months}{years}</>));
	}

}

export default Months;
