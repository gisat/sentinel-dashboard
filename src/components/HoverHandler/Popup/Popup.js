import React from 'react';
import PropTypes from 'prop-types';

import './style.css';

const WIDTH = 250;
const HEIGHT = 50;

class Popup extends React.PureComponent {

	static propTypes = {
		x: PropTypes.number,
		y: PropTypes.number,
		maxX: PropTypes.number,
		content: PropTypes.element
	};

	constructor(props) {
		super(props);

		this.ref = React.createRef();
	}

	render() {
		let maxX = window.innerWidth;
		let maxY = window.innerHeight;
		let x = this.props.x;

		// timeline fix
		// let y = this.props.y + 20;
		let y = this.props.y;

		let width = this.ref.current && this.ref.current.offsetWidth ? this.ref.current.offsetWidth : WIDTH;
		let height = this.ref.current && this.ref.current.offsetHeight ? this.ref.current.offsetHeight : HEIGHT;

		x = x - width / 2

		// positioning
		if ((x + width)> (maxX - 5)) {
			x = maxX - 5 - (width);
		}

		if (x < 5) {
			x = 5;
		}

		// positioning
		// if ((y + height) > (maxY - 5)) {
		// 	y = this.props.y - height - 5;
		// }
		// timeline fix
		// y = this.props.y - height;
		y = this.props.y;

		// timeline fix
		// if (y < 0) {
		// 	y = 0;
		// }

		// TODO calculate y

		let style = {
			bottom: y,
			left: x,
			width
		};

		return (
			<div style={style} className={"ptr-popup"} ref={this.ref}>
				{this.props.content ? React.cloneElement(this.props.content) : this.props.children}
			</div>
		);
	}
}

export default Popup;

