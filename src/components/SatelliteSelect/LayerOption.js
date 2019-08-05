import React from 'react';
import PropTypes from 'prop-types';
import { components } from 'react-select';
import './style.css';


const LayerOption = props => {
    props.innerProps.onClick = props.onClick;

    return (
        // <components.Option {...props} isFocused={false}>
        <components.Option {...props}>
            Layer {props.data.label}
        </components.Option>
    );
};

const getLayerOption = (onClick) => {
    return (props) => {
        return <LayerOption {...props} onClick={() => onClick(props.data)} />
    } 
}
export default LayerOption;
export {
    getLayerOption,
}