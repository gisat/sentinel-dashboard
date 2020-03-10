import React, { useState } from 'react';
import Button from '../../../atoms/Button';
import Icon from '../../../atoms/Icon';
import Select from '../../../atoms/Select/Select';
import moment from 'moment';

import './style.scss';

const SearchForm = ({coordinates, satellites, search, previousResultIndex, nextResultIndex, changeActiveResultIndex, result, time}) => {
    const [selectedSatellite, setSelectedSatellite] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const satellitesOptions = [...satellites].map((sat) => ({
        value: sat.id,
        label: sat.name,
    }));

    const productsOptions = selectedSatellite ? satellites.find(s => s.id === selectedSatellite.value).layers.map(l => ({
        value: l,
        label: l,
    })) : [];

    const onSearchClick = () => {
        search(selectedSatellite.value, selectedProduct.value, coordinates, new Date(time), 0);
    };

    const displayMoveButtons = Number.isInteger(previousResultIndex) ||  Number.isInteger(nextResultIndex);

    return (
        <div className={'ptr-search-form'}>
            <div className={'ptr-search-form-selects'}>
                <Button ghost className={'ptr-btn-no-wrap'} onClick={() => {}}>
                    <Icon icon='clock' />{moment(time).format('YYYY-MM-DD')}
                </Button>
                <Button ghost className={'ptr-btn-no-wrap'} onClick={() => {}}>
                    <Icon icon='location' />{`${Math.round(coordinates.longitude * 100) / 100} , ${Math.round(coordinates.latitude * 100) / 100}`}
                </Button>
                <Select
                    options={satellitesOptions}
                    onChange={(sat) => {setSelectedSatellite(sat); setSelectedProduct(null)}}
                    value={selectedSatellite}
                    placeholder={'Satellite'}
                    optionLabel='label'
                    optionValue='value'
                    />

                <Select
                    options={productsOptions}
                    onChange={(sat) => setSelectedProduct(sat)}
                    value={selectedProduct}
                    disabled={!selectedSatellite}
                    placeholder={'Product'}
                    optionLabel='label'
                    optionValue='value'
                    />
            </div>

            <div className={'ptr-search-form-navigation'}>
                <Button 
                    ghost
                    onClick={onSearchClick}
                    disabled={!selectedProduct || !selectedSatellite}
                    >
                    Search
                </Button>
                {   
                    displayMoveButtons ?
                    <Button 
                        ghost
                        onClick={() => changeActiveResultIndex(previousResultIndex)}
                        disabled = {!Number.isInteger(previousResultIndex)}
                        >
                        Previous
                    </Button> : null
                }
                {   
                    displayMoveButtons ?
                    <Button 
                        ghost
                        onClick={() => changeActiveResultIndex(nextResultIndex)}
                        disabled = {!Number.isInteger(nextResultIndex)}
                        >
                        Next
                    </Button> : null
                }
            </div>

        </div>
    )
}

export default SearchForm;