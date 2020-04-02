/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import React from 'react';
import PropTypes from 'prop-types';
import {getLayerOption} from './LayerOption'
import {getAcquisitionPlanOption} from './AcquisitionPlanOption'
import {getStatisticsOption} from './StatisticsOption'

const getOption = ({onLayerClick, onAcquisitionPlanClick, onStatisticsClick}) => {    
    return (props) => {
        if(props.data.type === 'product') {
            const Option = getLayerOption(onLayerClick);
            return <Option {...props} />
        };

        if(props.data.type === 'acquisitionPlan') {
            const Option = getAcquisitionPlanOption(onAcquisitionPlanClick);
            return <Option {...props} />
        };

        if(props.data.type === 'statistics') {
            const Option = getStatisticsOption(onStatisticsClick);
            return <Option {...props} />
        };

        return null;
    } 
}

export {
    getOption,
}