import React, {useContext} from 'react';
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
    setFollowNow,
    scrollToTime,
    zoomToTimeLevel,
    changeSelectTime,
    stopTimer,
    updateActiveLayer,
    toggleSatelliteFocus,
    updateInfoModal,
    setActiveInfoModal,
} from './context/actions';
import select from './context/selectors/';
import Modal from './components/Modal/';
import WorldWindMap from './components/WorldWindMap/index';
import SatelliteSelect from './components/SatelliteSelect';
import MapsTimeline, {LEVELS} from './components/MapsTimeline/MapsTimeline';
import TimeWidget from './components/TimeWidget/';

import period from './utils/period'
import {getNowUTC} from './utils/date'

//todo - to state
const timelinePeriod = period('2010/2025');

const now = moment(getNowUTC());
const start = now.clone().subtract(1, 'w');
const end = now.clone().add(1, 'w');


class App extends React.PureComponent {
    static contextType = Context

    constructor(props) {
        super(props)

        this.initialTimelinePeriod = period(`${start.format('YYYY-MM-DD')}/${end.format('YYYY-MM-DD')}`);

        this.onTimeChange = this.onTimeChange.bind(this);
        this.onSetActiveTimeLevel = this.onSetActiveTimeLevel.bind(this);
        this.onTimeClick = this.onTimeClick.bind(this);
        this.onSetTime = this.onSetTime.bind(this);
        this.onStartTimer = this.onStartTimer.bind(this);
        this.onStopTimer = this.onStopTimer.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onLayerClick = this.onLayerClick.bind(this);
        this.onInfoClick = this.onInfoClick.bind(this);
        this.onInfoModalClose = this.onInfoModalClose.bind(this);
        this.onSatteliteClick = this.onSatteliteClick.bind(this);
        this.onSatelliteCollapsClick = this.onSatelliteCollapsClick.bind(this);
        this.onLayerChanged = this.onLayerChanged.bind(this);
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

    onSetActiveTimeLevel(level) {
        const {state, dispatch} = this.context;
        const timelineState = select.components.timeline.getSubstate(state);
        const timeLevelDayWidth = LEVELS.find(l => l.level === level).end;
        zoomToTimeLevel(dispatch, level, timeLevelDayWidth, timelineState.dayWidth);
    }

    onTimeClick (evt) {
        const {state, dispatch} = this.context;
        dispatch(stopTimer());

        dispatch(setPreventReloadLayers(true));
        scrollToTime(dispatch, new Date(select.rootSelectors.getSelectTime(state)), evt.time, timelinePeriod, () => {
            dispatch(setPreventReloadLayers(false));
        });
    }

    onSetTime (time) {
        const {dispatch} = this.context;
        dispatch(changeSelectTime(time.toString()));
    }

    onStartTimer() {
        const {state, dispatch} = this.context;
        const selectTime = select.rootSelectors.getSelectTime(state);
        const scrollTime = selectTime ? new Date(selectTime) : getNowUTC();
        dispatch(setFollowNow(true));
        scrollToTime(dispatch, scrollTime, moment(getNowUTC()), timelinePeriod, () => {
            dispatch(setFollowNow(true));
        });
    }

    onStopTimer() {
        const {dispatch} = this.context;
        dispatch(stopTimer());
    }

    onResize() {
        const {state, dispatch} = this.context;
        let landscape = true;
        if(window.innerHeight > window.innerWidth){
            landscape = false;
        }
        
        if (select.rootSelectors.getLandscape(state) !== landscape) {
            dispatch(setOrientation(landscape));
        }
    }

    onInfoModalClose(modalKey) {
        const {state, dispatch} = this.context;
        dispatch(updateInfoModal(modalKey, {open: false}));
        dispatch(setActiveInfoModal(null));
    }
    onInfoClick(evt) {
        const {state, dispatch} = this.context;
        const modalKey = `${evt.satKey}-${evt.id}`;
        const modalState = select.rootSelectors.getInfoModal(state, modalKey)
        const open = modalState && modalState.open ? false : true;
        const layersSubstate = select.data.layers.getSubstate(state);
        const layer = select.data.layers.getByKey(layersSubstate, evt.id);
        const modalContent = {
            content: layer.description || 'no data',
            header: `${evt.satKey} - ${evt.id}`,
            open,
        };
        dispatch(updateInfoModal(modalKey, modalContent));
        dispatch(setActiveInfoModal(modalKey));
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

    onLayerChanged(layerKey, change) {
        const {dispatch} = this.context;
        dispatch(updateActiveLayer(layerKey, change))
    }

    render() {
        const {state} = this.context;
        let vertical = select.rootSelectors.getLandscape(state);
        const satelliteSelectState = select.components.satelliteSelect.getSubstate(state);
        const sateliteOptions = select.components.satelliteSelect.getSatelitesSelectOptions(state);
        
        const timelineState = select.components.timeline.getSubstate(state);
        const timelineOverlays = select.components.timeline.getOverlays(state);
        
        // prevent reloading layers while moving timeline
        const preventReloadLayers = select.rootSelectors.getPreventReloadLayers(state) || timelineState.moving;
        
        //info modal state
        const activeInfoModalKey = select.rootSelectors.getActiveInfoModalKey(state);
        const activeInfoModal = select.rootSelectors.getInfoModal(state, activeInfoModalKey);

        return (
            <div className={'app'}>
                <ReactResizeDetector
                    onResize = {this.onResize}
                    handleWidth
                    handleHeight />
                    {activeInfoModalKey ? <Modal 
                        modalKey = {activeInfoModalKey}
                        isOpen = {activeInfoModal.open}
                        content = {activeInfoModal.content}
                        header = {activeInfoModal.header}
                        onClose = {this.onInfoModalClose}
                        /> : null}
                <SatelliteSelect 
                    options={sateliteOptions}
                    open={satelliteSelectState.open}
                    onLayerClick={this.onLayerClick}
                    onInfoClick={this.onInfoClick}
                    onSatteliteClick={this.onSatteliteClick}
                    onCollapsClick={this.onSatelliteCollapsClick}
                    />
                <div className={className('timelineWrapper', {
                    vertical: vertical,
                    horizontal: !vertical,
                })}>
                    <MapsTimeline
                        activeLevel={timelineState.activeTimeLevel}
                        vertical = {vertical}
                        period = {timelinePeriod}
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
                    <TimeWidget
                        time={new Date(select.rootSelectors.getSelectTime(state))}
                        active={timelineState.activeTimeLevel}
                        onSelectActive={this.onSetActiveTimeLevel}
                        onSetTime={this.onSetTime}
                        onStartTimer={this.onStartTimer}
                        onStopTimer={this.onStopTimer}
                        nowActive={select.rootSelectors.getFollowNow(state)}
                        mouseTime={timelineState.mouseTime}
                        />
                    
                </div>
                <WorldWindMap 
                    layers = {select.rootSelectors.getActiveLayers(state)}
                    onLayerChanged={this.onLayerChanged}
                    preventReload={preventReloadLayers}
                    />
            </div>
        );
    }
}

export default App;
