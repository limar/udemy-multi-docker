const fib = require("./index");

const sequence = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
it("fib sequence is calculated correctly", () => {
    sequence.forEach((value, index) => {
        expect(fib(index)).toEqual(value);
    }) 
});
