import React from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';


const DAYWIDTHTRASHOLD = 100;
class Hours extends React.PureComponent {

	static propTypes = {

	};

	render() {

		//console.log('Days#render props', this.props);

		let start = moment(this.props.period.start);
		let end = moment(this.props.period.end);
		let hours = [];
		let current = moment(this.props.period.start);

		if (this.props.dayWidth > DAYWIDTHTRASHOLD) {
			while (end > current || current.format('HH') === end.format('HH')) {
				hours.push({
					hour: current.format('HH'),
					start: (current.format('YYYY-MM-DD-HH') === start.format('YYYY-MM-DD-HH')) ? start : moment(current).startOf('hour'),
					end: (current.format('YYYY-MM-DD-HH') === end.format('YYYY-MM-DD-HH')) ? end : moment(current).endOf('hour')
				});
				current.add(1,'hour');
			}
		}

		let ret = _.map(hours, hour => {
			let start = this.props.getX(hour.start);
			// let end = this.props.getX(day.end);
			// let monday = hour.start.format('dddd') === 'Monday';
			let height = this.props.height;
			if (!this.props.background) {
				height = height - 20
			}
			return (
				<line
					key={`${hour.start.toISOString()}+${hour.hour}`}
					x1={start + 0.5}
					x2={start + 0.5}
					y1={0}
					y2={height}
					className={classNames("ptr-timeline-hour", {background: this.props.background})}
				/>
			);
		});

		return React.createElement('g', null, ret);
	}

}

export default Hours;
