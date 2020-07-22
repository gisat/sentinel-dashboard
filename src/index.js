import './worldwind/www-overrides/DrawContext';
import './worldwind/www-overrides/SurfaceShapeTileBuilder';
import './worldwind/www-overrides/SurfaceShape';
import './worldwind/www-overrides/SurfaceShapeTile';
import './worldwind/www-overrides/TiledImageLayer';

import React from 'react';
import ReactDOM from 'react-dom';
import {ContextProvider} from './context/context';
import {forceSetPassiveEvents} from './utils/events';

import './styles/reset.css';
import './styles/index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';

document.getElementsByTagName('body')[0].classList.add('ptr-dark');

//prevent scrolling page
//first solution
// document.body.addEventListener('touchmove', function(e){ e.preventDefault(); }, { passive: false });

//second solution
// window.addEventListener("scroll", preventMotion, false);
// window.addEventListener("touchmove", preventMotion, false);

// function preventMotion(event)
// {
//     window.scrollTo(0, 0);
//     event.preventDefault();
//     event.stopPropagation();
// }

//Fix for passive events
forceSetPassiveEvents();

ReactDOM.render(
    <ContextProvider>
        <App/>
    </ContextProvider>,
    document.getElementById('root')
);

const setPageHeight = () => {
    window.setTimeout(() => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }, 50)
}

// We listen to the resize event
window.addEventListener('resize', setPageHeight)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
