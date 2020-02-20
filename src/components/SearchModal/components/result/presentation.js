import React, { useState } from 'react';
import moment from 'moment';
import Button from '../../../atoms/Button';
import Icon from '../../../atoms/Icon';
import Select from '../../../atoms/Select/Select';
import {parseEntry} from '../../../../worldwind/products/Products';
import ProductInformation from '../../../ProductsModal/productInformation';

import './style.scss';

const Result = ({result}) => {
    console.log(result);
    
    const parsedResult = parseEntry(result);
    const date = result && parsedResult ? moment(parsedResult.date[0]._text) : ''
    const heading = date ? `${date.format('YYYY-MM-DD')} ${parsedResult.str.platformname} - ${parsedResult.str.producttype}` : '';
    return (
        <div>
            {!result ? <div>Search in SCI Hub.</div> : null}
            {result ? <ProductInformation key={parsedResult.id} product={parsedResult} heading={heading} /> : null}
        </div>
    )
}

export default Result;