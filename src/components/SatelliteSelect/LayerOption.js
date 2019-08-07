import React from 'react';
import PropTypes from 'prop-types';
import { components } from 'react-select';
import './style.css';


const LayerOption = props => {
    props.innerProps.onClick = props.onClick;
    const activeClass = props.data.active ? 'active' : '';
    return (
        <div className={`ptr-satselect-option ${activeClass}`}>
            <components.Option {...props} isFocused={false}>
                Layer {props.data.label}
            </components.Option>
        </div>
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