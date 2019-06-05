import {createContext} from 'react'

export const Context = createContext({
    satelites: [],
    selected: null,
    focus: null,
    currentTime: null
});