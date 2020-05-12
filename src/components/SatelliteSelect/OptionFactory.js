/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import {LayerOption} from './LayerOption'
import {AcquisitionPlanOption} from './AcquisitionPlanOption'
import {StatisticsOption} from './StatisticsOption'

const getOption = ({onLayerClick, onAcquisitionPlanClick, onStatisticsClick}) => {    
    return (props) => {
        if(props.data.type === 'product') {
            return <LayerOption {...props} onClick={onLayerClick}/>
        };

        if(props.data.type === 'acquisitionPlan') {
            return <AcquisitionPlanOption {...props} onClick={onAcquisitionPlanClick}/>
        };

        if(props.data.type === 'statistics') {
            return <StatisticsOption {...props} onClick={onStatisticsClick}/>
        };

        return null;
    } 
}

export {
    getOption,
}