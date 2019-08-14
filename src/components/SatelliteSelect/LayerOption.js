import React from 'react';
import PropTypes from 'prop-types';
import { components } from 'react-select';
import Icon from '../Icon';
import NotificationBadge from '../NotificationBadge';

const LayerOption = props => {
    props.innerProps.onClick = props.onClick;

    //TODO extract into file
    const maxHeight = '32px'

    const iconsWrapperStyle = {
        flex: '0 1 auto',
        maxHeight: maxHeight,
        display: 'flex',
        alignItems: 'center',
    }

    const dataInfoWrapperStyle = {
        display: 'flex',
        justifyContent: 'center',
        width: '3.5rem',
        height: '100%',
        flex: '0 1 auto',
        maxHeight: '32px',
        alignItems: 'center',
    }

    const infoIconStyle = {
        maxWidth: '1.25rem'
    }

    const layerLabelStyle = {
        flex: '1 1 auto',
    }

    const Loader = <Icon icon='loader-oval' className='ptr-icon-warning' style={infoIconStyle}/>;
    const badgeLabel = props.data.totalCount === props.data.loadedCount ? props.data.totalCount : `${props.data.loadedCount}/${props.data.totalCount}`
    const CountBadge = <NotificationBadge label={badgeLabel} style={{position: 'relative'}} containerStyle={{position: 'relative'}}/>;
    return (
            <components.Option {...props} isFocused={false}>
                <div style={dataInfoWrapperStyle}>
                    {!props.data.disabled && props.data.active && props.data.status === 'loading' ? Loader : null}
                    {!props.data.disabled && props.data.active && props.data.status !== 'loading' ? CountBadge : null}
                </div>
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
        return <LayerOption {...props} onClick={() => !props.data.disabled && onClick(props.data)} />
    } 
}
export default LayerOption;
export {
    getLayerOption,
}