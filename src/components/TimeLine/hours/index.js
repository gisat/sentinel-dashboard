import React from 'react';

import map from 'lodash/map';
import moment from 'moment';
import {getMinutes, getDays, getHours} from '../utils/interval';
import Label from '../utils/textLabel';
import MinuteDash from '../minutes/MinuteDash';
import HourDash from './HourDash';
import DayDash from '../days/DayDash';
import './style.css';

const Hours = (props) => {
	const {periodLimit, getX, dayWidth, height, vertical} = props;
	const periodStart = moment(periodLimit.start);
	const periodEnd = moment(periodLimit.end);
	const hoursCfg = getHours(periodStart, periodEnd);
	const daysCfg = getDays(periodStart, periodEnd);

	let days = map(daysCfg, day => {
		const x = getX(day.start);
		const label = (
			<Label label={day.day} vertical={vertical} x={x} height={height} className={'ptr-timeline-month-label'} />
		);
		return (<DayDash key={`${day.year}-${day.month}-${day.day}`} label={label} x={x} vertical={vertical} height={1}/>);
	});

	let hours = map(hoursCfg, hour => {
		let x = getX(hour.start);

		let label = null
		if (dayWidth > 580) {
			label = (
				<Label label={hour.hour} vertical={vertical} x={x} height={height} className={'ptr-timeline-day-label'} />
			);
		}

		return (<HourDash key={`hours-${hour.year}-${hour.month}-${hour.day}-${hour.hour}`} label={label} x={x} vertical={vertical} height={2}/>);
	});

	let minutes = null;
	if (dayWidth > 4000) {
		const minutesCfg = getMinutes(periodStart, periodEnd);
		minutes = map(minutesCfg, minute => {
			if(dayWidth > 7000) {
				let x = getX(minute.start);
				return (<MinuteDash key={`${minute.year}-${minute.month}-${minute.day}-${minute.hour}-${minute.minute}`} x={x} vertical={vertical} height={3}/>);
			} else if(minute.minute === '30') {
				let x = getX(minute.start);
				return (<MinuteDash key={`${minute.year}-${minute.month}-${minute.day}-${minute.hour}-${minute.minute}`} x={x} vertical={vertical} height={3}/>);
			} else if(dayWidth > 6000 && (minute.minute === '15' || minute.minute === '45')) {
				let x = getX(minute.start);
				return (<MinuteDash key={`${minute.year}-${minute.month}-${minute.day}-${minute.hour}-${minute.minute}`} x={x} vertical={vertical} height={3}/>);
			} else {
				return null;
			}
		});
	}

	return React.createElement('g', null, (<>{days}{hours}{minutes}</>));
}

export default Hours;
