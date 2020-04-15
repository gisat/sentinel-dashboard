import React from 'react';
import {parseEntry} from '../../../../worldwind/products/Products';
import ProductInformation from '../../../productInformation';

import './style.scss';

const Result = ({result}) => {
    
    const parsedResult = parseEntry(result);
    return (
        <div>
            {!result ? <div>Search in SCI Hub.</div> : null}
            {result ? <ProductInformation key={parsedResult.id} product={parsedResult} /> : null}
        </div>
    )
}

export default Result;