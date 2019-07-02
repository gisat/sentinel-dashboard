import React from 'react';
import PropTypes from 'prop-types';
import './style.css';
import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import {getMonths, getDays} from '../utils/interval';

class Days extends React.PureComponent {


	static propTypes = {
		period: PropTypes.shape({
			start: PropTypes.object,
			end: PropTypes.object
		}),
		getX: PropTypes.func,
		dayWidth: PropTypes.number,
	};

	render() {
		const {period, getX, dayWidth, height} = this.props;
		const periodStart = moment(period.start);
		const periodEnd = moment(period.end);
		const daysCfg = getDays(periodStart, periodEnd);
		const monthsCfg = getMonths(periodStart, periodEnd);


		const months = _.map(monthsCfg, month => {
			const start = getX(month.start);
			const label = (
				<text
					x={start + 3}
					y={height - 2}
					className="ptr-timeline-month-label"
				>
					{month.year}-{month.month}
				</text>
			);

			return (
				<g
					key={`${month.year}-${month.month}`}
					className={classNames("ptr-timeline-month", (+month.start.format('M') % 2) ? 'odd' : 'even')}
				>
					{label}
				</g>
			);
		});

		let days = _.map(daysCfg, day => {
			let start = this.props.getX(day.start);
			// let end = this.props.getX(day.end);
			let monday = day.start.format('dddd') === 'Monday';

			let label = null
			if (this.props.dayWidth > 30) {
				label = (
					<text
						x={start + 3}
						y={height - 2}
						className="ptr-timeline-day-label"
					>
						{day.day}
					</text>
				);
			}

			if (this.props.dayWidth > 2 || (this.props.dayWidth > 0.3 && monday)) {
				let height = this.props.height;
				if (!this.props.background) {
					height = monday ? height - 12 : height - 15
				}
				return (
					<g
						key={`${day.year}-${day.month}-${day.day}`}
						className={classNames("ptr-timeline-day", {background: this.props.background})}
						>
						<line
							x1={start + 0.5}
							x2={start + 0.5}
							y1={0}
							y2={height}
							className={classNames(day.start.format('dddd'), {background: this.props.background})}
						/>
						{label}
					</g>
				);
			} else {
				return null;
			}
		});

		return React.createElement('g', null, (<>{days}{months}</>));
	}

}

export default Days;
