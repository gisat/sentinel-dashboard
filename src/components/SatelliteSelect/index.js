import React from 'react';
import PropTypes from 'prop-types';
import SelectBase, { components } from 'react-select';
import SatelliteGroupOption from './SatelliteOption';
import './style.css';

import Icon from '../Icon';

const ValueContainer = ({ children, ...props }) => (
    <components.ValueContainer {...props}><span>Products</span></components.ValueContainer>
  );  

const SatelliteOption = props => {
    const {groupData, ...restProps} = props;
    return (
            <components.GroupHeading {...restProps} onClick={() => {console.log(groupData.value)}}>
                <Icon icon={groupData.icon} />
                <span>
                    {props.children}
                </span>
                <Icon icon={'location'} />
            </components.GroupHeading>
    );
};

const LayerOption = props => {
    return (
        <components.Option {...props}>
            Layer
        </components.Option>
    );
};
  

class Select extends React.PureComponent {
    static propTypes = {
        satellites: PropTypes.array,
        open: PropTypes.bool,
        selectedLayers: PropTypes.array,
        onSelectLayer: PropTypes.func,
        onReleaseCamera: PropTypes.func,
        onFixCamera: PropTypes.func,
    }

    constructor(props) {
        super(props);
    }

    render() {
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
            Option: LayerOption,
            GroupHeading: SatelliteOption,
            Group: SatelliteGroupOption
        }

        const options = [
            {
                groupData: {
                    value: 'sat1',
                    icon: 'sentinel-1',
                },
                label: 'Satelit 1',
                options: [
                    {
                        id: 1,
                        label: 'zelena'
                    },
                    {
                        id: 2,
                        label: 'zluta'
                    }
                ]
            },
            {
                groupData: {
                    value: 'sat2',
                    icon: 'sentinel-2',
                },
                label: 'Satelit 2',
                options: [
                    {
                        id: 3,
                        label: 'cervena'
                    },
                    {
                        id: 1,
                        label: 'zelena'
                    }
                ]
            },
            {
                groupData: {
                    value: 'sat3',
                    icon: 'sentinel-3',
                },
                label: 'Satelit 3',
                options: [
                    {
                        id: 3,
                        label: 'cervena'
                    },
                    {
                        id: 1,
                        label: 'zelena'
                    }
                ]
            }, {
                groupData: {
                    value: 'sat4',
                    icon: 'sentinel-4',
                },
                label: 'Satelit 4',
                options: [
                    {
                        id: 3,
                        label: 'cervena'
                    },
                    {
                        id: 1,
                        label: 'zelena'
                    }
                ]
            }, {
                groupData: {
                    value: 'sat5',
                    icon: 'sentinel-5',
                },
                label: 'Satelit 5',
                options: [
                    {
                        id: 3,
                        label: 'cervena'
                    },
                    {
                        id: 1,
                        label: 'zelena'
                    }
                ]
            }
        ]

        return (
            <SelectBase
                className={'ptr-satellite-selector'}
                classNamePrefix={'ptr-select'}
                styles={customStyles}
                // components={props.components}
                // formatOptionLabel={this.getLabel}
                hideSelectedOptions={true}
                // onChange={this.onChange}
                // options={props.options}
                // value={props.value}
                title={'Satellites'}
                components={components}
                options={options}
                menuIsOpen={true}
            />
        );
    }

}

export default Select;