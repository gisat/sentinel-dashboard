import * as satelliteSelect from './components/satellitesSelect';
import * as timeline from './components/timeline';
import * as satellites from './data/satellites';
import * as layers from './data/layers';
import * as rootSelectors from './rootSelectors';

export default {
    rootSelectors,
    data: {
        satellites,
        layers,
    },
    components: {
        satelliteSelect,
        timeline,
    }
}