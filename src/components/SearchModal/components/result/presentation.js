import React, { useState } from 'react';
import moment from 'moment';
import Button from '../../../atoms/Button';
import Icon from '../../../atoms/Icon';
import Select from '../../../atoms/Select/Select';
import {parseEntry} from '../../../../worldwind/products/Products';
import ProductInformation from '../../../ProductsModal/productInformation';
import {getProductDownloadUrl} from '../../../../utils/product';

import './style.scss';

const getDownloadIcon = (url) => {
    if(url) {
        return (<Button ghost onClick={() => {window.open(url, '_blank')}} icon={'download'} className={'ptr-download-product'} small></Button>);
    } else {
        return null;
    }
}

const Result = ({result}) => {
    
    const parsedResult = parseEntry(result);
    const date = result && parsedResult ? moment(parsedResult.date[0]._text) : ''
    const downloadUrl = result && parsedResult ? getProductDownloadUrl(parsedResult) : null;
    const DownloadIcon = getDownloadIcon(downloadUrl);
    
    const headingText = date ? `${date.format('YYYY-MM-DD')} ${parsedResult.str.platformname} - ${parsedResult.str.producttype}` : '';
    const heading = <div className={'ptr-product-heading'}>{headingText}{DownloadIcon}</div>
    return (
        // <div className={'ptr-modal-scroolable-content-wrapper'}>
        <div>
            {!result ? <div>Search in SCI Hub.</div> : null}
            {result ? <ProductInformation key={parsedResult.id} product={parsedResult} heading={heading} /> : null}
        </div>
    )
}

export default Result;