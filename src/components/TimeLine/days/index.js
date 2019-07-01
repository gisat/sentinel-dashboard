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

	static propTypes = {

	};

	render() {
		const {period, getX, dayWidth, height} = this.props;
		const periodStart = moment(period.start);
		const periodEnd = moment(period.end);
		const days = getDays(periodStart, periodEnd);
		const months = getMonths(periodStart, periodEnd);


		const retMonths = _.map(months, month => {
			const start = getX(month.start);
			let label = null;
			if (dayWidth > 1.5) {
				label = (
					<text
						x={start + 3}
						y={height - 2}
						className="ptr-timeline-month-label"
					>
						{month.month}
					</text>
				);
			}
			return (
				<g
					key={month.month}
					className={classNames("ptr-timeline-month", (+month.start.format('M') % 2) ? 'odd' : 'even')}
				>
					{label}
				</g>
			);
		});

		let ret = _.map(days, day => {
			let start = this.props.getX(day.start);
			// let end = this.props.getX(day.end);
			let monday = day.start.format('dddd') === 'Monday';
			if (this.props.dayWidth > 2 || (this.props.dayWidth > 0.3 && monday)) {
				let height = this.props.height;
				if (!this.props.background) {
					height = monday ? height - 12 : height - 15
				}
				return (
					<line
						key={day.day}
						x1={start + 0.5}
						x2={start + 0.5}
						y1={0}
						y2={height}
						className={classNames("ptr-timeline-day", day.start.format('dddd'), {background: this.props.background})}
					/>
				);
			} else {
				return null;
			}
		});

		return React.createElement('g', null, (<>{retMonths}{ret}</>));
	}

}

export default Days;
