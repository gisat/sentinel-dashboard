import React from 'react';
import PropTypes from 'prop-types';
import {getMonths} from '../utils/interval';

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
		const months = getMonths(periodStart, periodEnd);

		const ret = _.map(months, month => {
			const start = getX(month.start);
			const end = getX(month.end);
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

		return React.createElement('g', null, ret);
	}

}

export default Months;
