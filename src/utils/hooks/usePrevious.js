import {useRef, useEffect} from 'react';

// https://stackoverflow.com/questions/53446020/how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
// https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
export default (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }