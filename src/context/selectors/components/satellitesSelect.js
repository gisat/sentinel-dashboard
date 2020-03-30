import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect';
import common from '../_common';
import {getSubstate as getSatellitesSubstate} from '../data/satellites';
import {getVisibleAcquisitionsPlans} from '../map';
import {getSubstate as getLayersSubstate, getByKey as getLayerByKey} from '../data/layers';
import {getPlansForDate, getLoadingAcquisitionsPlans} from '../data/acquisitionPlans';
import {getActiveLayers, getActiveLayerByKey, getFocusedSattelite, isLayerDisabled, getSelectTimePastOrCurrent, getSelectTime} from '../rootSelectors';
import satellitesUtils from '../../../utils/satellites';

const getSubstate = (state) => common.getByPath(state, ['components', 'satelliteSelect']);

const getVisible = createSelector(getSubstate, substate => substate.visible);

const getSatelitesSelectOptions = createSelector(
    [
        getSatellitesSubstate,
        getLayersSubstate,
        getActiveLayers,
        getFocusedSattelite,
        getSelectTimePastOrCurrent,
        getVisibleAcquisitionsPlans,
        getPlansForDate,
        getLoadingAcquisitionsPlans,
        getSelectTime,
    ],
    (satellites, layersSubState, activeLayers, focusedSattelite, selectTimePastOrCurrent, visibleAcquisitionsPlans, acquisitionPlansData, loadingAcquisitionsPlans, selectTime) => {
        
        const getLayerOption = (layerKey, satConfig) => {
            const satKey = satConfig.id;
            const layer = getLayerByKey(layersSubState, layerKey);
            const activeLayerCfg = getActiveLayerByKey(activeLayers, layerKey, satKey)
            
            return {
                type: 'product',
                id: layerKey,
                label: layer.name,
                // disabled: false,
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
            // const availableAPS = selectTimePastOrCurrent && acquisitionPlansData.some((p) => p.key === satConfig.id && p.plans.length > 0);
            const hasAPS = acquisitionPlansData.find((p) => p.key === satConfig.id);
            const activeAPS = visibleAcquisitionsPlans.includes(satConfig.id);
            const satOption = {
                groupData: {
                    value: satConfig.id,
                    icon: satConfig.iconClass,
                    disabled: !satellitesUtils.isSatelliteReleaseBeforeDate(satConfig, selectTime),
                    active: focusedSattelite === satConfig.id,
                    loading: loadingAcquisitionsPlans.some(l => l.key === satConfig.id), //todo
                },
                label: satConfig.name,
                options: []
            }

            //add acquisition plan option if sattelite contains data for it
            if(hasAPS) {
                satOption.options.push({
                    type: 'acquisitionPlan',
                    id: `acg_${satConfig.id}`,
                    satKey: satConfig.id,
                    label: 'Acquisition plan',
                    disabled: false,
                    active: activeAPS,
                    loadedCount: selectTimePastOrCurrent && hasAPS.plans && hasAPS.plans.length > 0 ? hasAPS.visiblePlans || 0 : 0,
                    totalCount: 0,
                })
            }

            if(satConfig.layers && satConfig.layers.length > 0) {
                satOption.options = [...satOption.options, ...satConfig.layers.map((layerKey) => getLayerOption(layerKey, satConfig))];
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
    getVisible,
}