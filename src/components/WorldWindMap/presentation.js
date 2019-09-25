import React, { Component } from 'react';
import PropTypes from "prop-types";
import WorldWind from 'webworldwind-gisat';
import WorldWindX from 'webworldwind-x';
import ClickPickController from './utils/ClickPickController';
import {isEqual} from 'lodash';
import {
    getLayers,
    getLayerKeyFromConfig,
    getLayerIdFromConfig,
    reloadLayersRenderable
} from './layers';
import './style.css';
import EnabledController from "../../worldwind/EnabledController";
import FreeCamera from '../../worldwind/FreeCamera';

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
        onProductsClick: PropTypes.func,
        layers: PropTypes.array,
        preventReload: PropTypes.bool,
        time: PropTypes.object,
    }

    static defaultProps = {    
        onLayerChanged: () => {},
        onProductsClick: () => {},
        layers: [],
    }
    constructor(props){
        super(props);
        this.wwd = null;
        this.wwdCreated = false;
    }
    shouldComponentUpdate(nextProps) {
        const layersChanged = nextProps.layers !== this.props.layers;
        const preventMovingChanged = nextProps.preventReload !== this.props.preventReload;

        return layersChanged || preventMovingChanged;
    }
    componentDidUpdate (prevProps) {
        const {time, focusedSatellite} = this.props;

        if(focusedSatellite !== prevProps.focusedSatellite) {
            console.log("focused satellite changed", focusedSatellite)
        }
        
        const enabledLayersKeys = this.props.layers.filter(l => !l.disabled);

        if(prevProps.layers !== this.props.layers) {
            const prevVisibleLayers = new Set(prevProps.layers.map((l) => getLayerKeyFromConfig(l)).sort())
            const visibleLayers = new Set(this.props.layers.map((l) => getLayerKeyFromConfig(l)).sort())
            
            // layer ID is composed by layer, satellite, end date, start date
            const prevLayers = new Set(prevProps.layers.map((l) => getLayerIdFromConfig(l)).sort())
            const Layers = new Set(this.props.layers.map((l) => getLayerIdFromConfig(l)).sort())
            
            // layer ID is composed by layer, satellite, end date, start date
            const disabledPrevLayers = new Set(prevProps.layers.filter(l => l.disabled).map((l) => getLayerKeyFromConfig(l)).sort())
            const disabledLayers = new Set(this.props.layers.filter(l => l.disabled).map((l) => getLayerKeyFromConfig(l)).sort())

            const visibilityChanged = !isEqual(prevVisibleLayers, visibleLayers);
            //check visibility change
            if(visibilityChanged) {
                //visibility changed
                const wwdLayers = getLayers(enabledLayersKeys, time, this.wwd);
                this.handleLayers(wwdLayers);
                
                //start loading layer
                //reload only new layers
                const newlyEnabledLayersKeys = [...visibleLayers].filter(l => !prevVisibleLayers.has(l));
                const newlyEnabledLayersCfg = this.props.layers.filter((cfg) => newlyEnabledLayersKeys.includes(getLayerKeyFromConfig(cfg)));
                reloadLayersRenderable(newlyEnabledLayersCfg, wwdLayers, this.wwd, this.props.onLayerChanged);
            }  else if(!isEqual(disabledPrevLayers, disabledLayers)) {
                //disabled changed
                const disabledLayersKeys = this.props.layers.filter(l => l.disabled).map((l) => getLayerKeyFromConfig(l));
                const disabledPrevLayersKeys = prevProps.layers.filter(l => l.disabled).map((l) => getLayerKeyFromConfig(l));
                const enabledLayersKeys = this.props.layers.filter(l => !l.disabled).map((l) => getLayerKeyFromConfig(l));
                const newlyEnabledLayersKeys = disabledPrevLayersKeys.filter(l => enabledLayersKeys.includes(l));
                const wwdLayers = getLayers(this.props.layers, time);

                wwdLayers.forEach(l => {
                    if(newlyEnabledLayersKeys.includes(l.displayName)) {
                        l.enabled = true;
                    };

                    if(disabledLayersKeys.includes(l.displayName)) {
                        l.enabled = false;
                    };
                    //redraw
                    this.wwd.redraw();
                })
            } else if(time !== prevProps.time) {

                const wwdLayers = getLayers(this.props.layers, time, this.wwd, this.props.onLayerChanged);
                this.handleLayers(wwdLayers);
                
            }
            
            if(!visibilityChanged && !isEqual(prevLayers, Layers)) {
                //layers date changed
                //TODO reload only changed layers
                const wwdLayers = getLayers(enabledLayersKeys, time);
                if(!this.props.preventReload) {
                    reloadLayersRenderable(enabledLayersKeys, wwdLayers, this.wwd, this.props.onLayerChanged);
                }
            }
        } else if(prevProps.preventReload !== this.props.preventReload && !this.props.preventReload) {
            const wwdLayers = getLayers(enabledLayersKeys, time);
            reloadLayersRenderable(enabledLayersKeys, wwdLayers, this.wwd, this.props.onLayerChanged);
        }
    }

    handleLayers(nextLayersData = []) {
        if(nextLayersData !== this.wwd.layers) {
            this.wwd.layers = nextLayersData;
            this.wwd.redraw();
        }
	}

    clickHandler(clickedRenderables = [], evt) {
        const renderables = clickedRenderables.objects.filter(r => {
			return !r.isTerrain;
        }).reverse();
        const products = new Set();

        renderables.forEach(r => {
            // products.add(r.parentLayer.displayName);
            products.add(r.userObject.userProperties.key);
        })

        if(products.size > 0) {
            this.props.onProductsClick([...products]);
        }
    }

    /**
     * In this method we create the Web World Wind component itself and store it in the state for the later usage.
     */
    componentDidMount(){
        const {time} = this.props;
        if(!this.wwdCreated) {
            this.wwd = new WorldWind.WorldWindow("wwd-results", null, EnabledController, FreeCamera);
            this.pickController = new ClickPickController(this.wwd, this.clickHandler.bind(this));
            this.wwdCreated=true;
            const enabledLayers = this.props.layers.filter(l => !l.disabled);
            const wwdLayers = getLayers(enabledLayers, time, this.wwd, this.props.onLayerChanged);
            this.handleLayers(wwdLayers);
            this.props.onWwdCreated(this.wwd);
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