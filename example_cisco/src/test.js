// const fnRegex =
//   /^function(?:.+)?(?:\s+)?\((.+)?\)(?:\s+|\n+)?\{(?:\s+|\n+)?((?:.|\n)+)\}$/m
// const fnEcmaRegex = /^\((.+)?\)(?:\s+|\n+)?=>(?:\s+|\n+)?((?:.|\n)+)$/m

// const check = (fnString) => {
//   const theFunction = fnRegex.exec(fnString) || fnEcmaRegex.exec(fnString)
//   if (theFunction.length >= 3) {
//     const fn = theFunction[2].split(' ')
//     return fn[0] === 'return' ? theFunction[2] : `return ${theFunction[2]}`
//   }
//   return false
// }

// console.log(check('function () {return b}'))
// console.log(check('() => b'))

// const test = check('() => 12 > 30 ? "Foo" : "Bar"')

// The function constructor can take in multiple statements separated by a semi-colon. Function expressions require a return statement with the function's name

// Observe that new Function is called. This is so we can call the function we created directly afterwards
const sumOfArray = new Function(
  'const sumArray = (arr) => arr.reduce((previousValue, currentValue) => previousValue + currentValue); return sumArray'
)()

// call the function
const sum = sumOfArray([1, 2, 3, 4])
console.log(sum)
// 10

// If you don't call new Function at the point of creation, you can use the Function.call() method to call it
const findLargestNumber = new Function(
  'function findLargestNumber (arr) { return Math.max(...arr) }; return findLargestNumber'
)

// call the function
const ln = findLargestNumber.call({}).call({}, [2, 4, 1, 8, 5])
console.log(ln)
// 8

// Function declarations do not require a return statement
const sayHello = new Function(
  'return function (name) { return `Hello, ${name}` }'
)()

// call the function
const hello = sayHello('world')
console.log(hello)
// Hello, world

const multiLineFn = new Function(
  'return (arr) => arr.map((a) => { if(a >= 2) { return a**a } return a * 2 })'
)()

// call the function
const mlfn = multiLineFn([1, 2, 3, 4])
console.log(mlfn)

const testFn = new Function(
  "return () => { if ( 1 <= 50 ) { async function getData() { const data = await fetch('https://jsonplaceholder.typicode.com/todos/1').then(res => res.json()).then(data => data); return data?.title }; return getData(); } return 1 * 1 - 1 * 1 * 0.05 }"
)()

// call the function
// const test = testFn()
// console.log(test)

console.log([1, 2, 3].includes(4))
