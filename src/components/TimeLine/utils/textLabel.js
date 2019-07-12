import React from 'react';
import PropTypes from 'prop-types';

class TextLabel extends React.PureComponent {
	constructor(props){
        super(props);
		this.node = React.createRef();
        this.state = {elHeight: 0};
    }
    
    componentDidMount() {
        const elHeight = this.node.current.getBoundingClientRect().height;
        this.setState({elHeight});
    }

	render() {
        const {label, vertical, height, x, className} = this.props;
        const {elHeight} = this.state;
        
        const xTransform = vertical ? -height + 3 : x + 3;
        const yTransform = vertical ? x + elHeight + 3 : height - 2;
        const transform = vertical ? `scale(-1,1)` : '';
        // const xTransform = vertical ? x + elHeight + 3 : x + 3;
        // const transform = vertical ? `rotate(270, ${xTransform}, ${height})` : ''
		return (
			<text
                ref={this.node}
                transform={transform}
                x={xTransform}
                y={yTransform}
                className={className}>
                {label}
            </text>
		);
	}
}

export default TextLabel;

