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
		content: PropTypes.element,
		getStyle: PropTypes.func,
	};

	constructor(props) {
		super(props);

		this.ref = React.createRef();
	}

	render() {
		let maxX = window.innerWidth;
		let maxY = window.innerHeight;
		let posX = this.props.x;
		let posY = this.props.y;

		let width = this.ref.current && this.ref.current.offsetWidth ? this.ref.current.offsetWidth : WIDTH;
		let height = this.ref.current && this.ref.current.offsetHeight ? this.ref.current.offsetHeight : HEIGHT;

		let style;

		if(typeof this.props.getStyle === 'function') {
			style = this.props.getStyle(posX, posY, maxX, maxY, width, height);
		} else {
			// positioning
			posX = posX + 15;
			posY = posY + 20;
			if ((posX + width) > (maxX - 5)) {
				posX = this.props.x - width - 5;
			}

			if (posX < 0) {
				posX = 0;
			}

			// positioning
			if ((posY + height) > (maxY - 5)) {
				posY = this.props.y - height - 5;
			}

			if (posY < 0) {
				posY = 0;
			}

			style = {
				top: posY,
				left: posX,
				width
			};

			// TODO calculate y
		}

		return (
			<div style={style} className={"ptr-popup"} ref={this.ref}>
				{this.props.content ? React.cloneElement(this.props.content) : this.props.children}
			</div>
		);
	}
}

export default Popup;

