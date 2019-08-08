import React from 'react';
import PropTypes from 'prop-types';
import SelectBase, { components } from 'react-select';
import SatelliteGroupOption from './SatelliteGroupOption';
import {getLayerOption} from './LayerOption';
import {getDropdownIndicator} from './DropdownIndicator';
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

const DropdownIndicator = ({ children, ...props }) => (
    <div onClick={() => {console.log("dropdown")}}>
        <components.DropdownIndicator {...props}>
            {children}
        </components.DropdownIndicator>
    </div>
);
  
class Select extends React.PureComponent {
    static defaultProps = {
        onLayerClick: () => {},
        onCollapsClick: () => {},
        onSatteliteClick: () => {},
    }

    static propTypes = {
        options: PropTypes.array,
        open: PropTypes.bool,
        selectedLayers: PropTypes.array,
        onLayerClick: PropTypes.func,
        onCollapsClick: PropTypes.func,
        onSatteliteClick: PropTypes.func,
        onReleaseCamera: PropTypes.func,
        onFixCamera: PropTypes.func,
    }

    render() {
        const {open, options, onLayerClick, onCollapsClick, onSatteliteClick} = this.props;

        // style
        //TODO -> extract style to file
        const color = 'rgb(189, 189, 189)';
        const activeColor = 'rgb(235, 235, 235)';
        const activeBackgroundColor = 'rgb(93, 93, 253)';
        const hoverBackgroundColor = 'rgba(139, 139, 208, 0.6)';
        const menuBackgroundColor = 'rgba(42, 46, 52, 0.64)';
        // end style

        const customStyles = {
            menu: (provided, state) => ({
              ...provided,
              backgroundColor: menuBackgroundColor,
            }),
            container: (provided, state) => ({
              ...provided,
              position: 'absolute',
              width: '200px'
            }),
            groupHeading:(provided, state) => {
                const style = {
                    ...provided,
                    alignItems: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: '0 .75rem',
                    '&:hover': {
                        backgroundColor: hoverBackgroundColor
                    },
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

                const active = state.data.active;
                const style = {
                    ...provided,
                    paddingTop: '0px',
                    paddingBottom: '0px',
                    paddingLeft: '3rem',
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
                  }

                  return style;
            },
          }

        const components = {
            ValueContainer: ValueContainer,
            Option: getLayerOption(onLayerClick),
            GroupHeading: getSatelliteGroupHeading(onSatteliteClick),
            Group: SatelliteGroupOption,
            SelectContainer,
            DropdownIndicator: getDropdownIndicator(onCollapsClick),
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
            />
        );
    }

}

export default Select;