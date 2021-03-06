import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import className from 'classnames';
import Div100vh from 'react-div-100vh'

import {Context} from './context/context';
import {
    setOrientation,
    updateTleData,
    updateApsData,
    changeSelectTime,
    setFollowNow,
    nowTick
} from './context/actions';
import select from './context/selectors/';
import ProductsModal from './components/ProductsModal/';
import SearchModal from './components/SearchModal/';
import WorldWindMap from './components/WorldWindMap';
import SatelliteSelect from './components/SatelliteSelect';
import MapsTimeline from './components/MapsTimeline';
import TimeWidget from './components/TimeWidget/';
import SearchToolbar from './components/SearchToolbar/';
import {getNowUTCString} from './utils/date';

class App extends React.PureComponent {
    static contextType = Context

    constructor(props) {
        super(props)

        this.state = {
            height: 0
        }

        this.onResize = this.onResize.bind(this);
        this.startTrackNowTime = this.startTrackNowTime.bind(this);
        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        const {state, dispatch} = this.context;
        this.startTrackNowTime();
        const initTime = getNowUTCString();
        changeSelectTime(initTime, dispatch, initTime)
        //set Tle data
        updateTleData(dispatch, initTime);
        
        //set Acquisition plans data
        updateApsData(dispatch);

        //Re-set follow now, because setting time in timeline set followNow to false.
        setTimeout(() => {
            dispatch(setFollowNow(true));
        }, 500);
    }


    tick() {
        const {state, dispatch} = this.context;
        nowTick(dispatch, state);
    }

    startTrackNowTime() {
        const {state, dispatch} = this.context;
        const timer = window.setInterval(this.tick, 1000);
        nowTick(dispatch, state);
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

        this.setState({height});
    }

    getMaxSatelliteSelectHeight() {
        const {state} = this.context;
        const vertical = select.rootSelectors.getLandscape(state);
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
        const vertical = select.rootSelectors.getLandscape(state);
        const satelliteSelectVisible = select.components.satelliteSelect.getVisible(state);
        const mapsTimelineVisible = select.components.timeline.getVisible(state);
        const timeWidgetVisible = select.components.timeWidget.getVisible(state);
        const searchToolbarVisible = select.components.searchToolbar.getVisible(state);
        const maxSelectHeight = this.getMaxSatelliteSelectHeight();

        return (
            <Div100vh>
                <div className={'app'}>
                    <ReactResizeDetector
                        onResize = {this.onResize}
                        handleWidth
                        handleHeight />                
                    <ProductsModal />
                    <SearchModal/>
                    {satelliteSelectVisible ? <SatelliteSelect  
                        maxHeight = {maxSelectHeight}
                    /> : null}
                    <div className={className('timelineWrapper', {
                        vertical: vertical,
                        horizontal: !vertical,
                    })}>
                        {mapsTimelineVisible ? <MapsTimeline /> : null}
                    </div>
                    <div className={className('search-toolbar-wrapper', {
                        vertical: vertical,
                        horizontal: !vertical,
                    })}>
                        {searchToolbarVisible ? <SearchToolbar /> : null}
                    </div>
                    <div className={className('time-widget-wrapper', {
                        vertical: vertical,
                        horizontal: !vertical,
                    })}>
                        {timeWidgetVisible ? <TimeWidget /> : null}
                    </div>
                    <WorldWindMap />
                </div>
            </Div100vh>
        );
    }
}

export default App;
