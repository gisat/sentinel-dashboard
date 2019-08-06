import { createSelector } from 'reselect'
import momentjs from 'moment';
import common from '../_common';
import {getSubstate as getSatellitesSubstate} from '../data/satellites';
import {getSubstate as getLayersSubstate, getByKey as getayerByKey} from '../data/layers';
import {getSelectTime} from '../rootSelectors';

const getSubstate = (state) => common.getByPath(state, ['components', 'satelliteSelect']);

const getEndDataTime = (state) => getSelectTime(state);
const getBeginDataTime = (state) => momentjs(getSelectTime(state)).subtract(1, 'hour').toDate();

// TODO - use re-reselect
const getSatelitesSelectOptions = createSelector(
    getSatellitesSubstate,
    getLayersSubstate,
    getBeginDataTime,
    getEndDataTime,
    (satellites, layersSubState, beginTime, endTime) => {
        const getLayerOption = (layerKey, satKey, beginTime, endTime) => {
            const layer = getayerByKey(layersSubState, layerKey);
            return {
                id: layer.key,
                label: layer.name,
                satKey: satKey,
                beginTime: beginTime,
                endTime: endTime,
            }
        }

        const getSateliteOption = (satConfig) => {
            const satOption = {
                groupData: {
                    value: satConfig.id,
                    icon: satConfig.iconClass,
                },
                label: satConfig.name,
                options: []
            }

            if(satConfig.layers && satConfig.layers.length > 0) {
                satOption.options = satConfig.layers.map((layerKey) => getLayerOption(layerKey, satConfig.id, beginTime, endTime));
            }

            return satOption;
        }

        const satOptions = satellites.map(getSateliteOption);

        return satOptions;
    }
)

export {
    getSatelitesSelectOptions,
    getSubstate,
}