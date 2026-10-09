import '@opencorestack/opengridx/styles';
import './styles.css';
import { installBench } from './harness';

// Nothing renders until bench/run.mjs calls window.__bench.mount(): the row data is generated
// first, outside every timing.
installBench();
document.documentElement.dataset.benchReady = 'true';
