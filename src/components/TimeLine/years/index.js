import React from 'react';
import PropTypes from 'prop-types';

import {getYears} from '../utils/interval';
import './style.css';

import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';

class Years extends React.PureComponent {

	static propTypes = {

	};

	render() {
		const {periodLimit, getX, dayWidth, height, vertical} = this.props;
		const periodStart = moment(periodLimit.start);
		const periodEnd = moment(periodLimit.end);
		const yearsCfg = getYears(periodStart, periodEnd);
		
		const years = _.map(yearsCfg, year => {
			let start = this.props.getX(year.start);
			// let end = this.props.getX(year.end);
			let label = null;
			if (this.props.dayWidth < 1.5) {
				const transform = vertical ? `rotate(270, ${start + 0.5}, ${this.props.height})` : ''
				label = (
					<text
						transform={transform}
						x={start + 3}
						y={this.props.height - 2}
						className="ptr-timeline-year-label"
					>
						{year.year}
					</text>
				);
			}
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

		return React.createElement('g', null, years);
	}

}

export default Years;
