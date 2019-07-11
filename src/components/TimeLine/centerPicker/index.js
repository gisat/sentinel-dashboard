import React from 'react';
import './picker.css';
import PropTypes from 'prop-types';

class Picker extends React.PureComponent {

	static propTypes = {
		width: PropTypes.number
	};

	render() {
		const {width, height} = this.props;
		const indicatorWidth = 10;
		if (width) {
			const position = width / 2;
			return (
				<g
					className="ptr-timeline-picker"
				>
					<rect
						x={position - indicatorWidth}
						width={indicatorWidth * 2 + 1}
						y={0}
						height={height}
					/>
					<line
						x1={position + 0.5}
						x2={position + 0.5}
						y1={0}
						y2={height}
					/>
				</g>
			);
		} else {
			return null;
		}
	}

}

export default Picker;
