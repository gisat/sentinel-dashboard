import types from '../../../types';

const componentID = 'searchToolbar';
export const setGeometry = (geometry) => {
    return {
        type: types.COMPONENT.SET,
        component: componentID,
        path: 'geometry',
        value: geometry,
    };
};

export const clearComponent = () => {
    return {
        type: types.COMPONENTS.SEARCH_TOOLBAR.CLEAR,
    };
};

export const setVisibility = (visible) => {
    return {
        type: types.COMPONENT.SET,
        component: componentID,
        path: 'visible',
        value: visible,
    };
};