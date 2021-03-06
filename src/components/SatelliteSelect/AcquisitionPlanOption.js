/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import React from 'react';
import PropTypes from 'prop-types';
import { components } from 'react-select';
import Icon from '../atoms/Icon';
import Loader from './Loader';
import NotificationBadge from '../NotificationBadge';

const AcquisitionPlanOption = (props) => {
    props.innerProps.onClick = () => {};
    props.innerProps.onMouseOver = () => {};
    props.innerProps.onMouseMove = () => {};


    //TODO extract into file
    // const maxHeight = '32px'

    // const iconsWrapperStyle = {
    //     flex: '0 1 auto',
    //     maxHeight: maxHeight,
    //     display: 'flex',
    //     alignItems: 'center',
    // }

    const dataInfoWrapperStyle = {
        display: 'flex',
        justifyContent: 'left',
        minWidth: '2rem',
        height: '100%',
        flex: '0 0 auto',
        maxHeight: '32px',
        alignItems: 'center',
    }

    // const infoIconStyle = css({
    //     cursor: 'pointer',
    //     maxWidth: '1.25rem',
    //     ':hover,:focus': {
    //         fill: 'rgb(255, 255, 255)',
    //         stroke: 'rgb(255, 255, 255)',
    //     }
    //   })

    const layerLabelStyle = {
        flex: '1 1 auto',
        marginLeft: '0.5rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }

    const badgeLabel = `${props.data.loadedCount}`;
    const CountBadge = <NotificationBadge label={badgeLabel} style={{position: 'relative'}} containerStyle={{position: 'relative'}}/>;
    return (
        <div onClick={props.onClick} data-satkey={props.data.satKey}>
            <components.Option {...props} isFocused={false}>
                <div style={dataInfoWrapperStyle}>
                    {!props.data.disabled && props.data.active ? CountBadge : null}
                </div>
                <span style={layerLabelStyle}>
                    {props.data.label}
                </span>
                {/* <span style={iconsWrapperStyle}  onClick={(evt) => {evt.preventDefault();evt.stopPropagation();props.onInfoClick(props.data)}}> */}
                    {/* <Icon icon='info' className='ptr-icon-warning' css={infoIconStyle}/> */}
                    {/* <Icon icon='warning' className='ptr-icon-warning' style={infoIconStyle}/> */}
                {/* </span> */}
            </components.Option>
            <div style={{position:'relative', height: '1px'}}>
                {props.data.status === 'loading' ? <Loader lkey={props.data.label}/> : null}
            </div>
        </div>
    );
};

// const CachedAcquisitionPlanOption = React.memo(AcquisitionPlanOption);

const getAcquisitionPlanOption = (onClick) => {    
    return (props) => {
        // return <AcquisitionPlanOption {...props} onClick={() => {onClick(props.data.satKey)}} />
        return <AcquisitionPlanOption {...props} onClick={onClick} data-satkey={props.data.satKey} />
    } 
}

export {
    getAcquisitionPlanOption,
    AcquisitionPlanOption
}