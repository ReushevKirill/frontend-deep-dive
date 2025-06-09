import { MyPromise } from '@my-lab/promise';

console.log('🚀 Playground started!');

const p1 = new MyPromise<number>(resolve => {
    console.log('Executor running...');
    setTimeout(() => resolve(1), 1000);
});

p1.then(value => {
    console.log('then 1:', value); // 1
    return `Hello from promise, value is ${value}`;
}).then(strValue => {
    console.log('then 2:', strValue); // 'Hello from promise, value is 1'
    throw new Error('Oops, something went wrong!');
}).catch(err => {
    console.error('Caught error:', err.message); // 'Oops, something went wrong!'
});

console.log('Code after promise definition.');
