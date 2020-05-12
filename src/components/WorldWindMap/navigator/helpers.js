
function getChangedViewParams(prev, next) {
		let changed = {};

		if (prev.boxRange !== next.boxRange){
			changed.boxRange = next.boxRange;
		}

		if (typeof next.heading === 'number' && prev.heading !== next.heading){
			changed.heading = next.heading;
		}

		if (typeof next.tilt === 'number' && prev.tilt !== next.tilt){
			changed.tilt = next.tilt;
		}

		if (typeof next.roll === 'number' && prev.roll !== next.roll){
			changed.roll = next.roll;
		}

		if (typeof next.headingCorrection === 'number' && prev.headingCorrection !== next.headingCorrection){
			changed.headingCorrection = next.headingCorrection;
		}

		if ((prev.center.lat !== next.center.lat) ||
			(prev.center.lon !== next.center.lon) ||
			(prev.center.altitude !== next.center.altitude)) {
			changed.center = {
				lat: next.center.lat,
				lon: next.center.lon,
				altitude: next.center.altitude,
			}
		}

		return changed;
}

/**
 * Update navigator of given World Window
 * @param wwd {WorldWindow}
 * @param view {Object}
 */
function update(wwd, view) {
	let state = wwd.navigator;
	let wwdUpdate = getWorldWindNavigatorFromViewParams(view);
	
	let shouldRedraw = false;

	if (wwdUpdate.range && state.range !== wwdUpdate.range){
		state.range = wwdUpdate.range;
		shouldRedraw = true;
	}

	if (typeof wwdUpdate.tilt === 'number' && state.tilt !== wwdUpdate.tilt){
		state.tilt = wwdUpdate.tilt;
		shouldRedraw = true;
	}

	if (typeof wwdUpdate.roll === 'number' && state.roll !== wwdUpdate.roll){
		state.roll = wwdUpdate.roll;
		shouldRedraw = true;
	}

	if (typeof wwdUpdate.heading === 'number' && state.heading !== wwdUpdate.heading){
		state.heading = wwdUpdate.heading;
		shouldRedraw = true;
	}

	if (wwdUpdate.lookAtLocation && wwdUpdate.lookAtLocation.latitude && state.lookAtLocation.latitude !== wwdUpdate.lookAtLocation.latitude){
		state.lookAtLocation.latitude = wwdUpdate.lookAtLocation.latitude;
		shouldRedraw = true;
	}

	if (wwdUpdate.lookAtLocation && wwdUpdate.lookAtLocation.longitude && state.lookAtLocation.longitude !== wwdUpdate.lookAtLocation.longitude){
		state.lookAtLocation.longitude = wwdUpdate.lookAtLocation.longitude;
		shouldRedraw = true;
	}

	if (wwdUpdate.lookAtLocation && wwdUpdate.lookAtLocation.altitude && state.lookAtLocation.altitude !== wwdUpdate.lookAtLocation.altitude){
		state.lookAtLocation.altitude = wwdUpdate.lookAtLocation.altitude;
		shouldRedraw = true;
	}

	if (state.lookAtLocation && state.lookAtLocation.altitude && wwdUpdate.lookAtLocation && !wwdUpdate.lookAtLocation.hasOwnProperty('altitude')){
		state.lookAtLocation.altitude = 0;
		shouldRedraw = true;
	}

	// if (wwd.verticalExaggeration && wwdUpdate.elevation && wwd.verticalExaggeration !== wwdUpdate.elevation){
	// 	wwd.verticalExaggeration = wwdUpdate.elevation;
	// 	shouldRedraw = true;
	// }

	if (shouldRedraw) {
		wwd.redraw();
	}
}

/**
 * Convert view to World Wind Navigator params
 * @param view {Object}
 * @returns {WorldWind.Navigator}
 */
function getWorldWindNavigatorFromViewParams(view) {
	let {center, boxRange, ...navigator} = view;

	if (boxRange) {
		navigator.range = boxRange;
	}

	if (center) {
		navigator.lookAtLocation = {};
		if (center.lat) {
			navigator.lookAtLocation.latitude = center.lat;
		}
		if (center.lon) {
			navigator.lookAtLocation.longitude = center.lon;
		}

		if (center.altitude) {
			navigator.lookAtLocation.altitude = center.altitude;
		}
	}

	return navigator;
}


function getViewParamsFromWorldWindNavigator(navigator) {
	let view = {};
	let {lookAtLocation, range} = navigator;

	if (range) {
		view.boxRange = range;
	}

	if (lookAtLocation) {
		view.center = {};
		if (lookAtLocation.latitude) {
			view.center.lat = lookAtLocation.latitude;
		}
		if (lookAtLocation.longitude) {
			view.center.lon = lookAtLocation.longitude;
		}
		if (lookAtLocation.altitude) {
			view.center.altitude = lookAtLocation.altitude;
		}
	}

	if (navigator.heading || navigator.heading === 0) {
		view.heading = navigator.heading;
	}

	if (navigator.tilt || navigator.tilt === 0) {
		view.tilt = navigator.tilt;
	}

	if (navigator.roll || navigator.roll === 0) {
		view.roll = navigator.roll;
	}

	return view;
}

const updateFixedView = (wwd, viewFixed) => {
	const navigator = wwd.navigator;
	const worldWindowController = wwd.worldWindowController;
	let changed = false;
	if(navigator.camera._isFixed !== viewFixed) {
		navigator.camera._isFixed = viewFixed;
		changed = true;
	}
	if(worldWindowController._isFixed !== viewFixed) {
		worldWindowController._isFixed = viewFixed;
		changed = true;
	}

	if(changed) {
		wwd.redraw();
	}
}

export default {
	getChangedViewParams,
	getViewParamsFromWorldWindNavigator,
	update,
	updateFixedView,
}