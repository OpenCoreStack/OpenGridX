// Fails the build if the published bundle contains a copy of React.
//
// React is a peer dependency: the consumer's copy must be the only one. A bundled
// react/jsx-runtime creates elements tagged for the React version we built with,
// which a consumer on another major version refuses to render.
import { readFileSync } from 'node:fs';

const BUNDLES = ['dist/opengridx.es.js', 'dist/opengridx.umd.js'];
const REACT_INTERNALS = ['react.transitional.element', 'react.element', '__CLIENT_INTERNALS_DO_NOT_USE', 'ReactCurrentOwner'];

let failed = false;
for (const file of BUNDLES) {
    const code = readFileSync(file, 'utf8');
    for (const marker of REACT_INTERNALS) {
        if (code.includes(marker)) {
            console.error(`${file}: contains React internals ("${marker}"); react/react-dom must stay external`);
            failed = true;
        }
    }
    if (!code.includes('react/jsx-runtime')) {
        console.error(`${file}: does not import react/jsx-runtime from the consumer`);
        failed = true;
    }
}
if (failed) process.exit(1);
console.log('check-bundle: react, react-dom and react/jsx-runtime are external');
