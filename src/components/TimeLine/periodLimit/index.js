import React from 'react';
import PropTypes from 'prop-types';
import {getPeriodLimits} from '../utils/interval';

import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import './style.css';

class PeriodLimit extends React.PureComponent {

	static propTypes = {
		periodLimit: PropTypes.shape({
			start: PropTypes.string,
			end: PropTypes.string
		}),
		period: PropTypes.shape({
			start: PropTypes.string,
			end: PropTypes.string
		}),
		getX: PropTypes.func,
		height: PropTypes.number,
		vertical: PropTypes.bool,
	};

	static defaultProps = {
		vertical: false,
	};

	render() {
		const {periodLimit, period, getX, height, vertical} = this.props;
		const periodStart = moment(periodLimit.start);
        const periodEnd = moment(periodLimit.end);
		const periodLimitStart = moment(period.start);
        const periodLimitEnd = moment(period.end);
        
		const periodLimitCfg = getPeriodLimits(periodStart, periodEnd, periodLimitStart, periodLimitEnd);
		const periodLimitsElms = _.map(periodLimitCfg, limit => {
			const start = getX(limit.start);
			const end = getX(limit.end);
			
			const x = vertical ? 0 : start;
			const y = vertical ? start : 0;
			const eHeight = vertical ? end-start : height;
			const width = vertical ? height : end-start;
            
			return (
				<g
					key={`${limit.key}`}
					className={classNames("ptr-timeline-periodLimit-limit")}
				>
					<rect
						x={x}
						width={width}
						y={y}
						height={eHeight}
					/>
				</g>
			);
		});

		return React.createElement('g', null, (<>{periodLimitsElms}</>));
	}

}

export default PeriodLimit;
