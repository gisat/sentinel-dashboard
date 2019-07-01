import React from 'react';
import './picker.css';
import PropTypes from 'prop-types';

class Picker extends React.PureComponent {

	static propTypes = {

	};

	render() {
		const indicatorWidth = 10;
		if (this.props.position) {
			return (
				<g
					className="ptr-timeline-picker"
				>
					<rect
						x={this.props.position - indicatorWidth}
						width={indicatorWidth * 2 + 1}
						y={0}
						height={this.props.height}
					/>
					<line
						x1={this.props.position + 0.5}
						x2={this.props.position + 0.5}
						y1={0}
						y2={this.props.height}
					/>
				</g>
			);
		} else {
			return null;
		}
	}

}

export default Picker;
