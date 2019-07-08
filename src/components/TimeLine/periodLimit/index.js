import React from 'react';
import PropTypes from 'prop-types';
import {getPeriodLimits} from '../utils/interval';

import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import './style.css';

class PeriodLimit extends React.PureComponent {

	static propTypes = {
		period: PropTypes.shape({
			start: PropTypes.object,
			end: PropTypes.object
		}),
		periodLimit: PropTypes.shape({
			start: PropTypes.object,
			end: PropTypes.object
		}),
		getX: PropTypes.func,
		height: PropTypes.number,
	};

	render() {
		const {period, periodLimit, getX, height} = this.props;
		const periodStart = moment(period.start);
        const periodEnd = moment(period.end);
		const periodLimitStart = moment(periodLimit.start);
        const periodLimitEnd = moment(periodLimit.end);
        
		const periodLimitCfg = getPeriodLimits(periodStart, periodEnd, periodLimitStart, periodLimitEnd);

		const periodLimitsElms = _.map(periodLimitCfg, limit => {
			const start = getX(limit.start);
			const end = getX(limit.end);
            
			return (
				<g
					key={`${limit.key}`}
					className={classNames("ptr-timeline-period-limit")}
				>
					<rect
						x={start}
						width={end-start}
						y={0}
						height={height}
					/>
				</g>
			);
		});

		return React.createElement('g', null, (<>{periodLimitsElms}</>));
	}

}

export default PeriodLimit;
