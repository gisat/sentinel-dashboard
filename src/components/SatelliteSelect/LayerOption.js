import React from 'react';
import PropTypes from 'prop-types';
import { components } from 'react-select';
import Icon from '../Icon';


const LayerOption = props => {
    props.innerProps.onClick = props.onClick;

    //TODO extract into file
    const iconsWrapperStyle = {
        flex: '0 1 auto',
        maxHeight: '32px',
    }

    const infoIconStyle = {
        maxWidth: '1.25rem',
    }

    const layerLabelStyle = {
        flex: '1 1 auto',
    }

    return (
            <components.Option {...props} isFocused={false}>
                <span style={layerLabelStyle}>
                    {props.data.label}
                </span>
                <span style={iconsWrapperStyle}>
                    <Icon icon='info' className='ptr-icon-warning' style={infoIconStyle}/>
                    <Icon icon='warning' className='ptr-icon-warning' style={infoIconStyle}/>
                </span>
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