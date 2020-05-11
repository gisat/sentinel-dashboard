import types from '../../../types';


export const setHeading = (satId, heading) => {
    return {
        type: types.DATA.SATELLITES.SET_HEADING,
        id: satId,
        heading: heading,
    };
};

export const setHeadingAndUpdateViewHeadingCorrection = (satId, heading) => {
    return {
        type: types.DATA.SATELLITES.SET_HEADING_AND_UPDATE_VIEW_HEADING_CORRECTION,
        id: satId,
        heading: heading,
    };
};