import types from '../../../types';

import {loadLatestProducts} from '../../../../components/WorldWindMap/layers';
import select from '../../../selectors/';
import {changeSelectTime} from '../../../actions';
import {getActiveSatProductsPairs} from '../../../selectors/rootSelectors'

const componentID = 'searchToolbar';
export const setGeometry = (geometry) => {
    return {
        type: types.COMPONENT.SET,
        component: componentID,
        path: 'geometry',
        value: geometry,
    };
};

export const setActiveIndex = (index) => {
    return {
        type: types.COMPONENT.SET,
        component: componentID,
        path: 'activeOrderedResultIndex',
        value: index,
    };
};

export const setLoading = (loading) => {
    return {
        type: types.COMPONENT.SET,
        component: componentID,
        path: 'loading',
        value: loading,
    };
};

export const setActiveIndexAndUpdateTime = (dispatch, state, index) => {
    const product = select.components.searchToolbar.getResultByIndex(state, index);
    if(product) {
        dispatch(setActiveIndex(index));
        const productTime = getResultMiddleDate(product).toUTCString();
        dispatch(changeSelectTime(productTime, dispatch, select.rootSelectors.getSelectTime(state), state));
    } else {
        dispatch(setActiveIndex(null));
    }
};

export const clearComponent = () => {
    return {
        type: types.COMPONENTS.SEARCH_TOOLBAR.CLEAR,
    };
};

const getResultBeginDate = (result) => {
    const beginPositionIndex = result.date.findIndex((d) => d.name === 'beginposition');
    const strDate = result.date[beginPositionIndex].content;
    return strDate ? new Date(strDate) : null;
}

const getResultEndDate = (result) => {
    const beginPositionIndex = result.date.findIndex((d) => d.name === 'endposition');
    const strDate = result.date[beginPositionIndex].content;
    return strDate ? new Date(strDate) : null;
}

const getResultMiddleDate = (result) => {
    const beginDate = getResultBeginDate(result);
    const endDate = getResultEndDate(result);

    if(beginDate && endDate) {
        const middleTime =  beginDate.getTime() + ((endDate.getTime() - beginDate.getTime()) / 2)
        return new Date(middleTime);
    } else {
        return null;
    }
    
}

/**
 * 
 * @param {Array} results [['s1b', [results]],...]
 */
export const saveResults = (results) => {
    return {
        type: types.COMPONENT.SET,
        component: componentID,
        path: 'orderedResults',
        value: results,
    };
}

/**
 * 
 * @param {Array} results [['s1b', [results]],...]
 */
export const orderResults = (results) => {
    const allResults = results.map(r => r[1]).flat().filter((a) => a);
    const sortedResults = [...allResults].sort((a, b) => {
        const aTime = getResultBeginDate(a);
        const bTime = getResultBeginDate(b);
        if(aTime && bTime) {
            return bTime.getTime() - aTime.getTime() ;
        }
    })

    return sortedResults;
}

export const updateSearch = async (dispatch, state) => {
    const activeSatProductsPairs = getActiveSatProductsPairs(state);
    const selectTime = select.rootSelectors.getSelectTime(state);
    const geometry = select.components.searchToolbar.getGeometry(state);
    if(activeSatProductsPairs && activeSatProductsPairs.length > 0 && geometry) {
        const location = {latitude: geometry.latitude, longitude: geometry.longitude};
        const promises = activeSatProductsPairs.map((pair) => {
            return searchProducts(pair[0], pair[1], location, selectTime, 0);
        });
        dispatch(setLoading(true));
        const results = await Promise.all(promises);
        dispatch(setLoading(false));
        const satResults = activeSatProductsPairs.map((pair, index) => [pair[0], results[index]]);
        const orderedResults = satResults && orderResults(satResults);
        if(satResults && satResults.length > 0 && orderedResults && orderedResults.length > 0) {
            dispatch(saveResults(orderedResults));
            dispatch(setActiveIndex(0));
            //FIXME - disable now Tracking
            dispatch(changeSelectTime(getResultMiddleDate(orderedResults[0]).toUTCString() ,dispatch,select.rootSelectors.getSelectTime(state), state));
            // setActiveIndexAndUpdateTime(dispatch, state, 0);
        } else {
            dispatch(saveResults([]));
            dispatch(setActiveIndex(null));                
        }
    } else {
        //clear results
        dispatch(saveResults([]));
        dispatch(setActiveIndex(null));
        //do nothing
        return;
    }
;

            
            //display satName and product type in search toolbar
            //move camera to product boundaries
            //move select time to nearest product time

    // const aps = await getAllAcquisitionPlans()
    // dispatch(setAcquisitionPlans(aps));
}

const searchProducts = async (satelliteId, productId, location, time, statrIndex) => {
    const shortName = `${satelliteId[0].toUpperCase()}-${satelliteId.substring(1,3).toUpperCase()}`;
    const endTime = time;
    const beginTime = new Date(new Date(endTime).setYear(endTime.getUTCFullYear() - 1));
    return await loadLatestProducts(shortName, [...productId], location, beginTime, endTime, statrIndex);
}

export const setVisibility = (visible) => {
    return {
        type: types.COMPONENT.SET,
        component: componentID,
        path: 'visible',
        value: visible,
    };
};