import React, { Component } from 'react';
import PropTypes from "prop-types";
import WorldWind from 'webworldwind-esa';
import WorldWindX from 'webworldwind-x';
import {isEqual} from 'lodash';
import {
    getLayers,
    getLayerKeyFromConfig,
    getLayerIdFromConfig,
    getLayerByName,
    reloadLayersRenderable
} from './layers';
import './style.css';

const {
    SentinelCloudlessLayer
} = WorldWindX;

/**
 * This component displays Web World Wind in the application. In order to decide what will the map look like and what
 * should be displayed on top of that it is possible to work with the wwd inside of the copmonentDidMount, where the
 * Web World Wind instance is also created.
 */
class Map extends Component {
    static propsTypes = {
        onLayerChanged: PropTypes.func,
        layers: PropTypes.array,
    }

    static defaultProps = {    
        onLayerChanged: () => {},
        layers: [],
    }
    constructor(props){
        super(props);
        this.wwd = null;
        this.wwdCreated = false;
    }
    shouldComponentUpdate(nextProps) {
        const layersChanged = nextProps.layers !== this.props.layers;

        return layersChanged;
    }
    componentDidUpdate (prevProps, prevState) {
        if(prevProps.layers !== this.props.layers) {
            const prevVisibleLayers = new Set(prevProps.layers.map((l) => getLayerKeyFromConfig(l)).sort())
            const visibleLayers = new Set(this.props.layers.map((l) => getLayerKeyFromConfig(l)).sort())
            
            // layer ID is composed by layer, satellite, end date, start date
            const prevLayers = new Set(prevProps.layers.map((l) => getLayerIdFromConfig(l)).sort())
            const Layers = new Set(this.props.layers.map((l) => getLayerIdFromConfig(l)).sort())
            
            //check visibility change
            if(!isEqual(prevVisibleLayers, visibleLayers)) {
                //visibility changed
                const wwdLayers = getLayers(this.props.layers);
                this.handleLayers(wwdLayers);
                
                //start loading layer

                //TODO - reload only new layers
                reloadLayersRenderable(this.props.layers, wwdLayers, this.wwd, this.props.onLayerChanged);
            } else if(!isEqual(prevLayers, Layers)) {
                //layers date changed
                //TODO reload only changed layers
                //TODO if already loading, stop
                const wwdLayers = getLayers(this.props.layers);
                reloadLayersRenderable(this.props.layers, wwdLayers, this.wwd, this.props.onLayerChanged);
            }
        }
    }

    handleLayers(nextLayersData = []) {
        if(nextLayersData !== this.wwd.layers) {
            this.wwd.layers = nextLayersData;
            this.wwd.redraw();
        }
	}


    /**
     * In this method we create the Web World Wind component itself and store it in the state for the later usage.
     */
    componentDidMount(){
        if(!this.wwdCreated) {
            this.wwd = new WorldWind.WorldWindow("wwd-results");
            this.wwdCreated=true;

            this.wwd.addLayer(new SentinelCloudlessLayer());
            this.wwd.redraw();
        }
    }

    render(){
        return (
            <div id="map">
                <canvas id="wwd-results" style={{
                    width: "100%",
                    height: "100%"
                }}></canvas>
            </div>
        )
    }
}

export default Map;