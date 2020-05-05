import * as satelliteSelect from './components/satellitesSelect';
import * as timeline from './components/timeline';
import * as timeWidget from './components/timeWidget';
import * as search from './components/search';
import * as searchToolbar from './components/searchToolbar';
import * as navigatorBackup from './components/navigatorBackup';
import * as satellites from './data/satellites';
import * as layers from './data/layers';
import * as orbits from './data/orbits';
import * as map from './map';
import * as rootSelectors from './rootSelectors';

export default {
    rootSelectors,
    data: {
        satellites,
        layers,
        orbits,
    },
    components: {
        satelliteSelect,
        timeline,
        timeWidget,
        search,
        searchToolbar,
        navigatorBackup,
    },
    map,
}