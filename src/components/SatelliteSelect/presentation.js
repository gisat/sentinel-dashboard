import React from 'react';
import PropTypes from 'prop-types';
import SelectBase, { components } from 'react-select';
import SatelliteGroupOption from './SatelliteGroupOption';
import {getLayerOption} from './LayerOption';
import {getSatelliteGroupHeading} from './SatelliteGroupHeading';

const ValueContainer = ({ children, ...props }) => (
    <components.ValueContainer {...props}><span>Products</span></components.ValueContainer>
);

const SelectContainer = ({ children, ...props }) => (
    // <div onClick={() => {console.log('on click')}}>
    <div>
        <components.SelectContainer {...props}>
            {children}
        </components.SelectContainer>
    </div>
);
  
class Select extends React.PureComponent {
    static defaultProps = {
        onLayerClick: () => {},
        onCollapsClick: () => {},
        onSatteliteClick: () => {},
        onAcquisitionPlanClick: () => {},
    }

    static propTypes = {
        options: PropTypes.array,
        open: PropTypes.bool,
        selectedLayers: PropTypes.array,
        onLayerClick: PropTypes.func,
        onInfoClick: PropTypes.func,
        onCollapsClick: PropTypes.func,
        onSatteliteClick: PropTypes.func,
        onAcquisitionPlanClick: PropTypes.func,
        onReleaseCamera: PropTypes.func,
        onFixCamera: PropTypes.func,
    }

    constructor(props) {
        super(props);
        const {onLayerClick, onInfoClick} = this.props;

        //Performance optimalisation.
        //React.memo dont rerender component so often
        this.optionComponent = getLayerOption(onLayerClick, onInfoClick);
    }

    render() {
        const {open, options, onCollapsClick, onSatteliteClick, onAcquisitionPlanClick, maxHeight} = this.props;

        // style
        //TODO -> extract style to file
        const color = 'rgb(189, 189, 189)';
        const activeColor = 'rgb(235, 235, 235)';
        const activeBackgroundColor = 'rgb(93, 93, 253)';
        const disabledBackgroundColor = 'rgba(175, 175, 179, 0.4)';
        const disabledActiveBackgroundColor = 'rgba(93, 93, 253, 0.4)';
        const hoverBackgroundColor = 'rgba(139, 139, 208, 0.6)';
        // const menuBackgroundColor = 'rgba(42, 46, 52, 0.64)';
        const menuContainerBackgroundColor = 'rgba(0, 0, 0, 0.7)';
        const menuBackgroundColor = 'rgba(0, 0, 0, 0.6)';
        // end style

        const customStyles = {
            menu: (provided, state) => ({
              ...provided,
              backgroundColor: menuBackgroundColor,
            }),
            menuList: (provided, state) => ({
              ...provided,
              maxHeight: maxHeight,
            }),
            container: (provided, state) => ({
              ...provided,
              position: 'absolute',
              top: '0.5rem',
              left: '0.5rem',
              width: '200px',
            }),
            valueContainer: (provided, state) => ({
                ...provided,
                color: 'rgb(237, 237, 237)',
            }),
            control: (provided, state) => ({
                ...provided,
                backgroundColor: menuContainerBackgroundColor,
                borderColor: 'rgba(236, 235, 255, 0.66)',
            }),
            groupHeading:(provided, state) => {
                const style = {
                    ...provided,
                    alignItems: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexFlow: 'column',
                    padding: '0 .75rem',
                    '&:hover': {
                        backgroundColor: hoverBackgroundColor
                    },
                  }

                  return style;
            },
            dropdownIndicator: (provided, state) => {
                const style = {
                    ...provided,
                    cursor: 'pointer',
                }
                return style;
            },
            option: (provided, state) => {

                const activeStyle = {
                    backgroundColor: activeBackgroundColor,
                    color: activeColor,
                    fill: activeColor,
                    stroke: activeColor,
                }

                const disabledStyle = {
                    backgroundColor: disabledBackgroundColor,
                    color: activeColor,
                    fill: activeColor,
                    stroke: activeColor,
                    cursor: 'not-allowed',
                }

                const disabledActiveStyle = {
                    backgroundColor: disabledActiveBackgroundColor,
                }

                const active = state.data.active;
                const disabled = state.data.disabled;
                const style = {
                    ...provided,
                    paddingTop: '0px',
                    paddingBottom: '0px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: color,
                    fill: color,
                    stroke: color,
                    ':hover': {
                        backgroundColor: hoverBackgroundColor
                    },
                    ...(active && activeStyle),
                    ...(disabled && disabledStyle),
                    ...(disabled && active && disabledActiveStyle),
                  }

                  return style;
            },
          }

        const components = {
            ValueContainer: ValueContainer,
            Option: this.optionComponent,
            GroupHeading: getSatelliteGroupHeading(onSatteliteClick, onAcquisitionPlanClick),
            Group: SatelliteGroupOption,
            SelectContainer,
        }

        return (
            <SelectBase
                className={'ptr-satellite-selector'}
                classNamePrefix={'ptr-select'}
                styles={customStyles}
                hideSelectedOptions={true}
                title={'Satellites'}
                components={components}
                options={options}
                menuIsOpen={open}
                closeMenuOnSelect={false}
                blurInputOnSelect={false}
                onMenuClose={onCollapsClick}
                onMenuOpen={onCollapsClick}
            />
        );
    }

}

export default Select;