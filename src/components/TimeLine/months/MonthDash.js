import React from 'react';
import {D2} from '../utils/dash';

export default (props) => {
	const {x, label, vertical} = props;
	const dLabel = label || null;
	return (
		<g
			className={'ptr-timeline-month'}
		>
			<D2 x={x} vertical={vertical}/>
			{dLabel}
		</g>
	);
} ;