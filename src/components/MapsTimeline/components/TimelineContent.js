import React from 'react';
import PropTypes from 'prop-types';

import Months from './Months';
import Days from './Days';
import Years from './Years';
import Mouse from './Mouse';
import Picker from './Picker';
// import Layers from './Layers';
import OutOfScopeOverlays from './OutOfScopeOverlays';

import './style.css';

const DEFAULT_HEIGHT = 40;

class TimelineContent extends React.PureComponent {

	static propTypes = {
		pickDateByCenter: PropTypes.bool,
		selectedDate: PropTypes.object
	};

	constructor(props){
		super(props);
		this.node = React.createRef();
	}


	componentDidMount() {
		if(this.props.onPinch && typeof this.props.onPinch === 'function') {
			this.node.current.addEventListener('gesturechange', this.props.onPinch);
		}

		if(this.props.onMouseDown && typeof this.props.onMouseDown === 'function') {
			this.node.current.addEventListener('touchstart', this.props.onMouseDown);
		}

		if(this.props.onMouseUp && typeof this.props.onMouseUp === 'function') {
			this.node.current.addEventListener('touchend', this.props.onMouseUp);
		}

		if(this.props.onMouseMove && typeof this.props.onMouseMove === 'function') {
			this.node.current.addEventListener('touchmove', this.props.onMouseMove);
		}
	
	  }
	
	  componentWillUnmount() {
		if(this.props.onPinch && typeof this.props.onPinch === 'function') {
			this.node.current.removeEventListener('gesturechange', this.props.onPinch);
		}

		if(this.props.onMouseDown && typeof this.props.onMouseDown === 'function') {
			this.node.current.removeEventListener('touchstart', this.props.onMouseDown);
		}

		if(this.props.onMouseUp && typeof this.props.onMouseUp === 'function') {
			this.node.current.removeEventListener('touchend', this.props.onMouseUp);
		}

		if(this.props.onMouseMove && typeof this.props.onMouseMove === 'function') {
			this.node.current.removeEventListener('touchmove', this.props.onMouseMove);
		}
	  }
	

	render() {

		//console.log('TimelineContent#render props', this.props);

		let height = (this.props.layers && this.props.layers.length * 10 + DEFAULT_HEIGHT) || DEFAULT_HEIGHT;

		let content = null;
		if (this.props.content) {
			content = React.createElement(this.props.content, {
				width: this.props.width,
				dayWidth: this.props.dayWidth,
				period: this.props.period,
				dataPeriod: this.props.dataPeriod,
				getX: this.props.getX,
				mouseX: this.props.mouseX,
				mouseBufferWidth: this.props.mouseBufferWidth
			});
		}

		return (
			<div
				ref={this.node}
				className="ptr-timeline-content"
				onMouseLeave={this.props.onMouseLeave}
				onWheel={this.props.onWheel}
				onMouseDown={this.props.onMouseDown}
				onMouseUp={this.props.onMouseUp}
				onMouseMove={this.props.onMouseMove}
			>
				{content}
				<svg
					width={this.props.width}
					height={height}
					onMouseEnter={this.props.displayTooltip}
					onMouseLeave={this.props.hideTooltip}
				>
					<Months
						period={this.props.period}
						getX={this.props.getX}
						height={height}
						dayWidth={this.props.dayWidth}
					/>
					<Days
						period={this.props.period}
						getX={this.props.getX}
						height={height}
						dayWidth={this.props.dayWidth}
					/>
					<Years
						period={this.props.period}
						getX={this.props.getX}
						height={height}
						dayWidth={this.props.dayWidth}
					/>
					<Mouse
						mouseBufferWidth={this.props.mouseBufferWidth}
						mouseX={this.props.mouseX}
						height={height}
					/>
					{this.props.pickDateByCenter ? <Picker position={this.props.width / 2} height={height}/> : null}
					{/* <Layers
						layers={this.props.layers}
						dayWidth={this.props.dayWidth}
						getX={this.props.getX}
						onPeriodClick={this.props.onLayerPeriodClick}
						period={this.props.period}
						activeLayers={this.props.activeLayers}
						activeLayerPeriods={this.props.activeLayerPeriods}
					/> */}
					<OutOfScopeOverlays
						dayWidth={this.props.dayWidth}
						getX={this.props.getX}
						period={this.props.period}
						dataPeriod={this.props.dataPeriod}
						height={height}
					/>
				</svg>
			</div>
		);
	}

}

export default TimelineContent;