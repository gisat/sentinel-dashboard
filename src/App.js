import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import className from 'classnames';
import moment from 'moment';

import {Context} from './context/context';
import {
    toggleLayer,
    setPreventReloadLayers,
    updateComponent,
    startTrackNowTime,
    setOrientation,
    scrollToTime,
    changeSelectTime,
    stopTimer,
    toggleSatelliteFocus,
} from './context/actions';
import select from './context/selectors/';
import ProductsModal from './components/ProductsModal/';
import WorldWindMap from './components/WorldWindMap';
import SatelliteSelect from './components/SatelliteSelect';
import MapsTimeline, {LEVELS} from './components/MapsTimeline/MapsTimeline';
import TimeWidget from './components/TimeWidget/';

import period from './utils/period'
import {getNowUTC} from './utils/date'

const now = moment(getNowUTC());
const start = now.clone().subtract(1, 'w');
const end = now.clone().add(1, 'w');


class App extends React.PureComponent {
    static contextType = Context

    constructor(props) {
        super(props)

        this.state = {
            height: 0
        }

        const initialTimelinePeriod = period(`${start.format('YYYY-MM-DD')}/${end.format('YYYY-MM-DD')}`);
        this.initialTimelinePeriod = {
            start: initialTimelinePeriod.start.toDate().toString(),
            end: initialTimelinePeriod.end.toDate().toString(),
        }

        this.onTimeChange = this.onTimeChange.bind(this);
        this.onTimeClick = this.onTimeClick.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onLayerClick = this.onLayerClick.bind(this);
        this.onSatteliteClick = this.onSatteliteClick.bind(this);
        this.onSatelliteCollapsClick = this.onSatelliteCollapsClick.bind(this);
    }

    componentDidMount() {
        const {state, dispatch} = this.context;
        startTrackNowTime(state, dispatch);
    }

    onTimeChange(timelineState) {
        const {state, dispatch} = this.context;
        const curTimelineState = select.components.timeline.getSubstate(state);
        
        if(timelineState.moving !== curTimelineState.moving) {
            dispatch(updateComponent('timeline', {moving: timelineState.moving}))
        }

        if(select.rootSelectors.getSelectTime(state) && timelineState.centerTime && timelineState.centerTime.toString() !== select.rootSelectors.getSelectTime(state)) {
            dispatch(stopTimer());
            dispatch(changeSelectTime(timelineState.centerTime.toString()));
        }

        if(timelineState.activeLevel && timelineState.activeLevel !== curTimelineState.activeTimeLevel) {
            dispatch(updateComponent('timeline', {activeTimeLevel: timelineState.activeLevel}))
        }

        if(timelineState.mouseTime !== curTimelineState.mouseTime) {
            dispatch(updateComponent('timeline', {mouseTime: timelineState.mouseTime}))
        }

        if(timelineState.dayWidth && timelineState.dayWidth !== curTimelineState.dayWidth) {
            dispatch(updateComponent('timeline', {dayWidth: timelineState.dayWidth}))
        }
    }

    onTimeClick (evt) {
        const {state, dispatch} = this.context;
        const periodLimit = select.rootSelectors.getPeriodLimit(state);
        dispatch(stopTimer());

        dispatch(setPreventReloadLayers(true));
        scrollToTime(dispatch, new Date(select.rootSelectors.getSelectTime(state)), evt.time, periodLimit, () => {
            dispatch(setPreventReloadLayers(false));
        });
    }

    onResize(width, height) {
        const {state, dispatch} = this.context;
        let landscape = true;
        if(window.innerHeight > window.innerWidth){
            landscape = false;
        }
        
        if (select.rootSelectors.getLandscape(state) !== landscape) {
            dispatch(setOrientation(landscape));
        }

        this.setState({
            height
        })
    }
    
    onLayerClick(evt) {
        const {state, dispatch} = this.context;
        dispatch(toggleLayer(evt.satKey, evt.id))
    }
    onSatteliteClick(satKey) {
        const {state, dispatch} = this.context;
        dispatch(toggleSatelliteFocus(satKey, state))
    }
    
    onSatelliteCollapsClick(evt) {
        const {state, dispatch} = this.context;
        const satelliteSelectState = select.components.satelliteSelect.getSubstate(state);
        if(satelliteSelectState.open) {
            dispatch(updateComponent('satelliteSelect', {open: false}))
        } else {
            dispatch(updateComponent('satelliteSelect', {open: true}))
        }
    }

    getMaxSatelliteSelectHeight() {
        const {state} = this.context;
        let vertical = select.rootSelectors.getLandscape(state);
        const windowHeight = this.state.height;
        const timelineHeight = 45;
        const timeWidgetHeight = 46;
        const satelliteSelectHeight = 38;
        const satelliteSelectMargin = 2*8;
        const satelliteSelectTop = 8;
        const maxSelectHeight = !vertical ?  (windowHeight - timelineHeight - timeWidgetHeight - satelliteSelectHeight - satelliteSelectMargin - satelliteSelectTop) : (windowHeight - satelliteSelectHeight - satelliteSelectMargin - satelliteSelectTop)
        return maxSelectHeight;
    }

    render() {
        const {state} = this.context;
        let vertical = select.rootSelectors.getLandscape(state);
        const satelliteSelectState = select.components.satelliteSelect.getSubstate(state);
        const sateliteOptions = select.components.satelliteSelect.getSatelitesSelectOptions(state);
        const periodLimit = select.rootSelectors.getPeriodLimit(state);
        const timelineState = select.components.timeline.getSubstate(state);
        const timelineOverlays = select.components.timeline.getOverlays(state);
        
        const maxSelectHeight = this.getMaxSatelliteSelectHeight();
        return (
            <div className={'app'}>
                <ReactResizeDetector
                    onResize = {this.onResize}
                    handleWidth
                    handleHeight />                
                <ProductsModal />
                <SatelliteSelect 
                    options={sateliteOptions}
                    open={satelliteSelectState.open}
                    onLayerClick={this.onLayerClick}
                    onSatteliteClick={this.onSatteliteClick}
                    onCollapsClick={this.onSatelliteCollapsClick}
                    maxHeight = {maxSelectHeight}
                    />
                <div className={className('timelineWrapper', {
                    vertical: vertical,
                    horizontal: !vertical,
                })}>
                    <MapsTimeline
                        activeLevel={timelineState.activeTimeLevel}
                        vertical = {vertical}
                        period = {periodLimit}
                        initialPeriod = {this.initialTimelinePeriod}
                        // onLayerPeriodClick: this.onLayerPeriodClick,
                        onChange = {this.onTimeChange}
                        time={new Date(select.rootSelectors.getSelectTime(state))}
                        overlays={timelineOverlays}
                        LEVELS={LEVELS}
                        dayWidth={timelineState.dayWidth}
                        onTimeClick={this.onTimeClick}
                    />
                </div>
                <div className={className('time-widget-wrapper', {
                    vertical: vertical,
                    horizontal: !vertical,
                })}>
                    <TimeWidget />
                </div>
                <WorldWindMap />
            </div>
        );
    }
}

export default App;
