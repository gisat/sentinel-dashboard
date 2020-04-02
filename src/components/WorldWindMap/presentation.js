import React, { Component } from 'react';
import PropTypes from "prop-types";
import WorldWindow from '../../worldwind/WorldWindow';
import WorldWind from 'webworldwind-esa';
import ClickPickController from './utils/ClickPickController';
import decorateWorldWindowController from './controllers/WorldWindowControllerDecorator';
import navigator from './navigator/helpers';
import {isEqual, isEmpty} from 'lodash';
import {
    getLayers,
    getLayerKeyFromConfig,
    getLayerIdFromConfig,
    reloadLayersRenderable,
    reloadFootprintLayersRenderable,
    getLayerKeySCIHubResult,
} from './layers';
import './style.css';
import EnabledController from "../../worldwind/EnabledController";
import FreeCamera from '../../worldwind/FreeCamera';
import Animator from '../../worldwind/Animator';

const {
    EarthElevationModel
} = WorldWind;

export const defaultMapView = {
	center: {
		lat: 50.099577,
		lon: 14.425960
	},
	boxRange: 10000000,
	tilt: 0,
	roll: 0,
	heading: 0
};

/**
 * This component displays Web World Wind in the application. In order to decide what will the map look like and what
 * should be displayed on top of that it is possible to work with the wwd inside of the copmonentDidMount, where the
 * Web World Wind instance is also created.
 */
class Map extends Component {
    static propsTypes = {
        onLayerChanged: PropTypes.func,
        onProductsClick: PropTypes.func,
        searchOnCoords: PropTypes.func,
        onViewChange: PropTypes.func,
        view: PropTypes.object,
        layers: PropTypes.array,
        preventReload: PropTypes.bool,
        time: PropTypes.object, //select time
        currentTime: PropTypes.object, //current time
    }

    static defaultProps = {    
        onLayerChanged: () => {},
        onProductsClick: () => {},
        searchOnCoords: () => {},
        onViewChange: () => {},
        layers: [],
        view: {},
    }
    constructor(props){
        super(props);
        this.wwd = null;
        this.wwdCreated = false;
    }

    componentDidUpdate (prevProps) {
        const {time, focusedSatellite, currentTime} = this.props;

        if(focusedSatellite !== prevProps.focusedSatellite) {
            console.log("focused satellite changed", focusedSatellite)
        }

        // TODO compare references only?
        if (this.props.view && prevProps.view !== this.props.view) {
            this.updateNavigator();
        }
        
        const enabledLayersKeys = this.props.layers.filter(l => !l.disabled);

        if(prevProps.layers !== this.props.layers) {
            const prevVisibleLayers = new Set([
                ...prevProps.layers.map((l) => getLayerKeyFromConfig(l)).sort(),
            ])

            const visibleLayers = new Set([
                ...this.props.layers.map((l) => getLayerKeyFromConfig(l)).sort(),
            ])
            
            // layer ID is composed by layer, satellite, end date, start date
            const prevLayers = new Set([
                ...prevProps.layers.map((l) => getLayerIdFromConfig(l)).sort(),
            ]);

            const Layers = new Set([
                ...this.props.layers.map((l) => getLayerIdFromConfig(l)).sort(),
            ])

            // layer ID is composed by layer, satellite, end date, start date
            const disabledPrevLayers = new Set(prevProps.layers.filter(l => l.disabled).map((l) => getLayerKeyFromConfig(l)).sort())
            const disabledLayers = new Set(this.props.layers.filter(l => l.disabled).map((l) => getLayerKeyFromConfig(l)).sort())

            const visibilityChanged = !isEqual(prevVisibleLayers, visibleLayers);
            const newlyEnabledLayersKeys = [...visibleLayers].filter(l => !prevVisibleLayers.has(l));
            //check visibility change
            if(visibilityChanged && !newlyEnabledLayersKeys.some(lk => disabledLayers.has(lk))) {
                //visibility changed
                const wwdLayers = getLayers(enabledLayersKeys, time, this.wwd, this.props.onLayerChanged, currentTime);
                this.handleLayers(wwdLayers);
                
                //start loading layer
                //reload only new layers
                
                const newlyEnabledLayersCfg = this.props.layers.filter((cfg) => newlyEnabledLayersKeys.includes(getLayerKeyFromConfig(cfg)));
                reloadLayersRenderable(newlyEnabledLayersCfg, wwdLayers, this.wwd, this.props.onLayerChanged);
            }  else if(!isEqual(disabledPrevLayers, disabledLayers)) {
                //disabled changed
                const disabledLayersKeys = this.props.layers.filter(l => l.disabled).map((l) => getLayerKeyFromConfig(l));
                const disabledPrevLayersKeys = prevProps.layers.filter(l => l.disabled).map((l) => getLayerKeyFromConfig(l));
                const enabledLayersKeys = this.props.layers.filter(l => !l.disabled).map((l) => getLayerKeyFromConfig(l));
                const newlyEnabledLayersKeys = disabledPrevLayersKeys.filter(l => enabledLayersKeys.includes(l));
                const wwdLayers = getLayers(this.props.layers, time, this.wwd, this.props.onLayerChanged, currentTime);

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
            } else if(time.toString() !== prevProps.time.toString() || currentTime.toString() !== prevProps.currentTime.toString()) {
                const notDisabledLayers = this.props.layers.filter(l => !l.disabled);
                const wwdLayers = getLayers(notDisabledLayers, time, this.wwd, this.props.onLayerChanged, currentTime);
                this.handleLayers(wwdLayers);
                
            }
            
            if(!visibilityChanged && !isEqual(prevLayers, Layers)) {
                //layers date changed
                //TODO reload only changed layers
                const wwdLayers = getLayers(enabledLayersKeys, time, this.wwd, this.props.onLayerChanged, currentTime);
                if(!this.props.preventReload) {
                    reloadLayersRenderable(enabledLayersKeys, wwdLayers, this.wwd, this.props.onLayerChanged);
                }
            }
        }
        
        if(prevProps.preventReload !== this.props.preventReload && !this.props.preventReload) {
            const disabledLayersKeys = this.props.layers.filter(l => l.disabled).map((l) => getLayerKeyFromConfig(l));
            const wwdLayers = getLayers(enabledLayersKeys, time, this.wwd, this.props.onLayerChanged, currentTime);
            //dont reload disabled layers
            reloadLayersRenderable(enabledLayersKeys.filter(lk => !disabledLayersKeys.includes(lk)), wwdLayers, this.wwd, this.props.onLayerChanged);
        }
    }

    handleLayers(nextLayersData = []) {
        if(nextLayersData !== this.wwd.layers) {
            this.wwd.layers = nextLayersData;
            this.wwd.redraw();
        }
	}

    longClickHandler(clickedRenderables = [], evt, x, y, time, type) {
        const {searchOnCoords} = this.props;
        const terrainPick = this.wwd.pickTerrain([x, y]);
        if(type === 'timeoutClick' && terrainPick && terrainPick.objects && terrainPick.objects[0]){
            const terrainCoords = terrainPick.objects[0].position;
            //searchOnCoords
            searchOnCoords(terrainCoords);
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

    onNavigatorChange(event) {
		if (event) {
            const viewParams = navigator.getViewParamsFromWorldWindNavigator(event);
            
			const changedViewParams = navigator.getChangedViewParams({...defaultMapView, ...this.props.view}, viewParams);

			if(this.props.onViewChange) {
				if (!isEmpty(changedViewParams)) {
                    this.props.onViewChange(changedViewParams);
				}
			}
		}
	}

    /**
     * In this method we create the Web World Wind component itself and store it in the state for the later usage.
     */
    componentDidMount(){
        const {time, currentTime} = this.props;
        if(!this.wwdCreated) {
            const elevationModel = new EarthElevationModel();
            this.wwd = new WorldWindow("wwd-results", elevationModel, EnabledController, FreeCamera);
            
            decorateWorldWindowController(this.wwd.worldWindowController);
            this.wwd.worldWindowController.onNavigatorChanged = this.onNavigatorChange.bind(this);

            this.wwd.animator = new Animator(this.wwd);
            this.wwd.deepPicking = true;

            window.wwd = this.wwd;
            this.pickController = new ClickPickController(this.wwd, this.clickHandler.bind(this));
            this.longClickPickController = new ClickPickController(this.wwd, this.longClickHandler.bind(this), 1500, 1000, 1000);
            this.wwdCreated=true;
            const enabledLayers = this.props.layers.filter(l => !l.disabled);
            const wwdLayers = getLayers(enabledLayers, time, this.wwd, this.props.onLayerChanged, currentTime);
            this.handleLayers(wwdLayers);
            this.props.onWwdCreated(this.wwd);
            this.updateNavigator(defaultMapView);
        }
    }

	updateNavigator(defaultView) {
		let currentView = defaultView || navigator.getViewParamsFromWorldWindNavigator(this.wwd.navigator);
        let nextView = {...currentView, ...this.props.view};

        //call onUpdateNavigator on each wwd layer
        const layers = this.wwd.layers;
        for (const layer of layers) {
            if(layer.onUpdateNavigator && typeof layer.onUpdateNavigator === 'function') {
                layer.onUpdateNavigator(nextView);
            }
        }
		navigator.update(this.wwd, nextView);
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