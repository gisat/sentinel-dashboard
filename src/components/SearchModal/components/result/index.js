import React from 'react';
import Presentation from './presentation';
import select from '../../../../context/selectors/';
import {withContext} from '../../../../context/withContext';

const Result = (props) => {
    const {dispatch, state} = props;
    const results = select.components.search.getResults(state);
    const activeResultIndex = select.components.search.getActiveResultIndex(state);
    const result = (Number.isInteger(activeResultIndex) && results && results.length > 0 && results[activeResultIndex]) || null;

    return (
        <Presentation 
            result={result}
            />
    )
}

export default withContext(Result);