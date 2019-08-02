import React from 'react';
import PropTypes from 'prop-types';
import SelectBase, { components } from 'react-select';
import SatelliteGroupOption from './SatelliteGroupOption';
import {getLayerOption} from './LayerOption';
import {getDropdownIndicator} from './DropdownIndicator';
import SatelliteGroupHeading from './SatelliteGroupHeading';
import './style.css';

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
    }

    static propTypes = {
        options: PropTypes.array,
        open: PropTypes.bool,
        selectedLayers: PropTypes.array,
        onLayerClick: PropTypes.func,
        onCollapsClick: PropTypes.func,
        onReleaseCamera: PropTypes.func,
        onFixCamera: PropTypes.func,
    }

    render() {
        const {open, options, onLayerClick, onCollapsClick} = this.props;

        const customStyles = {
            container: (provided, state) => ({
              ...provided,
              position: 'absolute',
              width: '200px'
            }),
            groupHeading: (provided, state) => ({
                ...provided,
                alignItems: 'center',
                // color: 'rgba(255, 255, 255, 0.75)',
                cursor: 'pointer',
                display: 'flex',
                padding: '0 .75rem',
            
              }),
          }

        const components = {
            ValueContainer: ValueContainer,
            Option: getLayerOption(onLayerClick),
            GroupHeading: SatelliteGroupHeading,
            Group: SatelliteGroupOption,
            SelectContainer,
            DropdownIndicator: getDropdownIndicator(onCollapsClick),
        }

        return (
            <SelectBase
                className={'ptr-satellite-selector'}
                classNamePrefix={'ptr-select'}
                styles={customStyles}
                // components={props.components}
                // formatOptionLabel={this.getLabel}
                hideSelectedOptions={true}
                // onChange={this.onChange}
                // value={props.value}
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