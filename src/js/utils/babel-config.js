import * as Babel from '@babel/standalone';
import protect from './loop-protect';

function printLine(line) {
    console.error(`Bad loop on line ${line}`);
}

const timeout = 100;
Babel.registerPlugin('loopProtection', protect(timeout, printLine));
const transform = source =>
    Babel.transform(source, {
        plugins: ['loopProtection'],
        retainLines: true
    }).code;

export default transform;
