import React from 'react';
import PropTypes from 'prop-types';
import { components } from 'react-select';

const DropdownIndicator = props => {
    props.innerProps.onClick = props.onClick;

    return (
        <components.DropdownIndicator {...props}>
        </components.DropdownIndicator>
    );
};

const getDropdownIndicator = (onClick) => {
    return (props) => {
        return <DropdownIndicator {...props} onClick={() => onClick(props)} />
    } 
}
export default DropdownIndicator;
export {
    getDropdownIndicator,
}