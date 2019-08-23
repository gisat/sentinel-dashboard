import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import className from 'classnames';
import moment from 'moment';

import {Context} from './context/context';
import {
    toggleLayer,
    updateComponent,
    startTrackNowTime,
    setOrientation,
    toggleSatelliteFocus,
} from './context/actions';
import select from './context/selectors/';
import ProductsModal from './components/ProductsModal/';
import WorldWindMap from './components/WorldWindMap';
import SatelliteSelect from './components/SatelliteSelect';
import MapsTimeline from './components/MapsTimeline';
import TimeWidget from './components/TimeWidget/';

class App extends React.PureComponent {
    static contextType = Context

    constructor(props) {
        super(props)

        this.state = {
            height: 0
        }

        this.onResize = this.onResize.bind(this);
        this.onLayerClick = this.onLayerClick.bind(this);
        this.onSatteliteClick = this.onSatteliteClick.bind(this);
        this.onSatelliteCollapsClick = this.onSatelliteCollapsClick.bind(this);
    }

    componentDidMount() {
        const {state, dispatch} = this.context;
        startTrackNowTime(state, dispatch);
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
        const satelliteSelectState = select.components.satelliteSelect.getSubstate(state);
        const sateliteOptions = select.components.satelliteSelect.getSatelitesSelectOptions(state);
        
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
                    <MapsTimeline />
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
