import * as React from 'react';
import {Context} from './context';
export function withContext(Component) {
  return (props) => {
    return (
      <Context.Consumer>
        {(contexts) => <Component {...props} {...contexts} />
        }
      </Context.Consumer>
    )
  }
}