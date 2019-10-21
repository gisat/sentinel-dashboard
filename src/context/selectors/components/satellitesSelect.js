import { createSelector } from 'reselect'
import common from '../_common';
import {getSubstate as getSatellitesSubstate} from '../data/satellites';
import {getVisibleAcquisitionsPlans} from '../map';
import {getSubstate as getLayersSubstate, getByKey as getLayerByKey} from '../data/layers';
import {getPlansForDate, getLoadingAcquisitionsPlans} from '../data/acquisitionPlans';
import {getActiveLayers, getActiveLayerByKey, getFocusedSattelite, isLayerDisabled, getSelectTimePastOrCurrent, getSelectTime} from '../rootSelectors';
import satellitesUtils from '../../../utils/satellites';

const getSubstate = (state) => common.getByPath(state, ['components', 'satelliteSelect']);

const getSatelitesSelectOptions = createSelector(
    getSatellitesSubstate,
    getLayersSubstate,
    getActiveLayers,
    getFocusedSattelite,
    getSelectTimePastOrCurrent,
    getVisibleAcquisitionsPlans,
    getPlansForDate,
    getLoadingAcquisitionsPlans,
    getSelectTime,
    (satellites, layersSubState, activeLayers, focusedSattelite, selectTimePastOrCurrent, visibleAcquisitionsPlans, acquisitionPlansData, loadingAcquisitionsPlans, selectTime) => {
        
        const getLayerOption = (layerKey, satConfig) => {
            const satKey = satConfig.id;
            const layer = getLayerByKey(layersSubState, layerKey);
            const activeLayerCfg = getActiveLayerByKey(activeLayers, layerKey, satKey)
            
            return {
                id: layerKey,
                label: layer.name,
                disabled: selectTimePastOrCurrent || !satellitesUtils.isSatelliteReleaseBeforeDate(satConfig, selectTime),
                satKey: satKey,
                active: activeLayerCfg ? true : false,
                status: activeLayerCfg && activeLayerCfg.status,
                message: activeLayerCfg && activeLayerCfg.message,
                loadedCount: activeLayerCfg && activeLayerCfg.loadedCount,
                totalCount: activeLayerCfg && activeLayerCfg.totalCount,
            }
        }

        const getSateliteOption = (satConfig) => {
            const satOption = {
                groupData: {
                    value: satConfig.id,
                    icon: satConfig.iconClass,
                    disabled: !satellitesUtils.isSatelliteReleaseBeforeDate(satConfig, selectTime),
                    active: focusedSattelite === satConfig.id,
                    activeAPS: visibleAcquisitionsPlans.includes(satConfig.id),
                    availableAPS: selectTimePastOrCurrent && acquisitionPlansData.some((p) => p.key === satConfig.id && p.plans.length > 0),
                    loading: loadingAcquisitionsPlans.some(l => l.key === satConfig.id), //todo
                },
                label: satConfig.name,
                options: ['']
            }

            if(satConfig.layers && satConfig.layers.length > 0) {
                satOption.options = satConfig.layers.map((layerKey) => getLayerOption(layerKey, satConfig));
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