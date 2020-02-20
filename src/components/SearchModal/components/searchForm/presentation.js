import React, { useState } from 'react';
import Button from '../../../atoms/Button';
import Icon from '../../../atoms/Icon';
import Select from '../../../atoms/Select/Select';
import {parseEntry} from '../../../../worldwind/products/Products';
import ProductInformation from '../../../ProductsModal/productInformation';

import './style.scss';

const SearchForm = ({coordinates, satellites, search, previousResultIndex, nextResultIndex, changeActiveResultIndex, result}) => {
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
        search(selectedSatellite.value, selectedProduct.value, coordinates);
    };

    const parsedResult = parseEntry(result);

    return (
        <div className={'ptr-search-form'}>
            <div className={'ptr-search-form-selects'}>
                {/* <Button className={'ptr-coordinates'}> */}
                <Button ghost onClick={() => {}}>
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
                    Number.isInteger(previousResultIndex) ?
                    <Button 
                        ghost
                        onClick={() => changeActiveResultIndex(previousResultIndex)}
                        >
                        Previous
                    </Button> : null
                }
                {   
                    Number.isInteger(nextResultIndex) ?
                    <Button 
                        ghost
                        onClick={() => changeActiveResultIndex(nextResultIndex)}
                        >
                        Next
                    </Button> : null
                }
            </div>

        </div>
    )
}

export default SearchForm;