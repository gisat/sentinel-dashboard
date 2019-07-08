import React from 'react';
import PropTypes from 'prop-types';
import {getOverlays} from '../utils/interval';

import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import './style.css';

class Overlay extends React.PureComponent {

	static propTypes = {
		period: PropTypes.shape({
			start: PropTypes.object,
			end: PropTypes.object
		}),
		getX: PropTypes.func,
		dayWidth: PropTypes.number,
        height: PropTypes.number,
        overlays: PropTypes.array,
	};

	render() {
		const {period, overlays, getX} = this.props;
		const periodStart = moment(period.start);
        const periodEnd = moment(period.end);
        
		const overlaysCfg = getOverlays(periodStart, periodEnd, overlays);

		const overlaysElms = _.map(overlaysCfg, overlay => {
			const start = getX(overlay.start);
			const end = getX(overlay.end);
            let label = null
            if(overlay.label) {
                label = (
                    <text
                        x={start + 3}
                        y={overlay.top + overlay.height - 2}
                        className="ptr-timeline-overlay-label"
                    >
                        {overlay.label}
                    </text>
                );
            }
			return (
				<g
					key={`${overlay.key}`}
					className={classNames("ptr-timeline-overlay", overlay.classes)}
				>
					<rect
						x={start}
						width={end-start}
						y={overlay.top}
                        height={overlay.height}
                        fill={overlay.backgound}
					/>
					{label}
				</g>
			);
		});

		return React.createElement('g', null, (<>{overlaysElms}</>));
	}

}

export default Overlay;
