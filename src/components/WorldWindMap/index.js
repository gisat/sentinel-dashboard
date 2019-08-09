import React, { Component } from 'react';
import PropTypes from "prop-types";
import WorldWind from 'webworldwind-esa';
import WorldWindX from 'webworldwind-x';
import {isEqual} from 'lodash';
import {
    getLayers,
    getLayerKeyFromConfig,
    getLayerByName,
    setRenderables
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
        this.state = {
            wwdCreated: false
        };
    }

    componentDidUpdate (prevProps) {
        if(prevProps.layers !== this.props.layers) {
            const prevVisibleLayers = new Set(prevProps.layers.map((l) => getLayerKeyFromConfig(l)).sort())
            const visibleLayers = new Set(this.props.layers.map((l) => getLayerKeyFromConfig(l)).sort())
            if(!isEqual(prevVisibleLayers, visibleLayers)) {
                const layers = getLayers(this.props.layers);
                this.handleLayers(layers);

                this.props.layers.forEach((layerCfg) => {
                    const layerKey = getLayerKeyFromConfig(layerCfg);
                    const layer = getLayerByName(layerKey, layers);
                    //start loading layer
                    this.props.onLayerChanged(
                        {
                            satKey: layerCfg.satKey,
                            layerKey: layerCfg.layerKey
                        }, {
                            status: 'loading'
                        })


                    //todo only on new layer or if layer config change
                    setRenderables(layer, layerCfg, this.wwd.redraw.bind(this.wwd)).then((msg) => {
                        this.wwd.redraw();
                        if(msg.status === 'error') {
                            this.props.onLayerChanged(
                                {
                                    satKey: layerCfg.satKey,
                                    layerKey: layerCfg.layerKey
                                }, {
                                    status: 'error',
                                    message: msg.message,
                                })
                        } else {
                            this.props.onLayerChanged(
                                {
                                    satKey: layerCfg.satKey,
                                    layerKey: layerCfg.layerKey
                                }, 
                                {
                                    status: 'ok',
                                    loadedCount: msg.loadedCount,
                                    totalCount: msg.totalCount,
                                }
                            )
                        }
                    });
                })
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
        if(!this.state.wwd) {
            this.wwd = new WorldWind.WorldWindow("wwd-results");
            this.setState({wwd: this.wwd});

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