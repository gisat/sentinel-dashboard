import React, { useState } from 'react';
import Button from '../../../atoms/Button';
import Select from '../../../atoms/Select/Select';
import {parseEntry} from '../../../../worldwind/products/Products';
import ProductInformation from '../../../ProductsModal/productInformation';
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
        <div>
            <span>
                {coordinates.longitude}, {coordinates.latitude}
            </span>
            <Select
                options={satellitesOptions}
                onChange={(sat) => {setSelectedSatellite(sat); setSelectedProduct(null)}}
                value={selectedSatellite}
                optionLabel='label'
                optionValue='value'
                />

            <Select
                options={productsOptions}
                onChange={(sat) => setSelectedProduct(sat)}
                value={selectedProduct}
                optionLabel='label'
                optionValue='value'
                />

            <Button 
                ghost
                onClick={onSearchClick}
                disabled={!selectedProduct && !selectedSatellite}
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
            {
                result ? <ProductInformation key={parsedResult.id} product={parsedResult} /> : null
            }
        </div>
    )
}

export default SearchForm;