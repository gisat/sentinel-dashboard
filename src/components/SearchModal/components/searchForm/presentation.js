import React, { useState } from 'react';
import SelectBase, { components } from 'react-select';
import Button from '../../../Button';
import searchForm from '.';

const SearchForm = ({coordinates, satellites, search}) => {
    const [selectedSatellite, setSelectedSatellite] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const satellitesOptions = satellites.map((sat) => ({
        value: sat.id,
        label: sat.name,
    }));

    const productsOptions = selectedSatellite ? satellites.find(s => s.id === selectedSatellite.value).layers.map(l => ({
        value: l,
        label: l,
    })) : [];

    const onSearchClick = () => {
        search(selectedSatellite.value, selectedProduct.value);
    };

    return (
        <div>
            <span>
                ${coordinates.longitude}, ${coordinates.latitude}
            </span>
            <SelectBase 
                options={satellitesOptions}
                onChange={(sat) => {setSelectedSatellite(sat); setSelectedProduct(null)}}
                value={selectedSatellite}
                />

            <SelectBase 
                options={productsOptions}
                onChange={(sat) => setSelectedProduct(sat)}
                value={selectedProduct}
                />

            <Button 
                ghost
                onClick={onSearchClick}
                >
                Search
            </Button>
        </div>
    )
}

export default SearchForm;