import { sum } from "./sample";

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});

test("adds 'Hello' + ' World' to equal 'Hello World'", () => {
  expect(sum("Hello", " World")).toBe("Hello World");
});
