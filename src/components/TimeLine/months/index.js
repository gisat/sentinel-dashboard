import React from 'react';
import Label from '../utils/textLabel';
import MonthDash from './MonthDash';
import YearDash from '../years/YearDash';
import {getYears, getMonths} from '../utils/interval';
import './style.css';

import map from 'lodash/map';
import moment from 'moment';

export const Months = (props) => {
	const {periodLimit, getX, dayWidth, height, vertical} = props;
	const periodStart = moment(periodLimit.start);
	const periodEnd = moment(periodLimit.end);
	const monthsCfg = getMonths(periodStart, periodEnd);
	const yearsCfg = getYears(periodStart, periodEnd);

	const months = map(monthsCfg, month => {
		if(month.month !== '01') {
			let x = getX(month.start);
			let label = null;
			if (dayWidth > 1.5) {
				label = (
					<Label label={month.month} vertical={vertical} x={x} height={height} className={'ptr-timeline-month-label'} />
				);
			}
	
			return (<MonthDash key={`${month.year}-${month.month}`} x={x} label={label} vertical={vertical}/>);
		} else {
			return null;
		}
	});

	
	
	const years = map(yearsCfg, year => {
		let x = getX(year.start);
		let label = <Label label={year.year} vertical={vertical} x={x} height={height} className={'ptr-timeline-year-label'} />
		return (<YearDash key={year.year} label={label} x={x} vertical={vertical}/>);
	});

	return (
		<g>
			{years}{months}
		</g>
	)
}

export default Months;
