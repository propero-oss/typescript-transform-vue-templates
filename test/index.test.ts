import transformer from "src/main";
import { expectTranspile } from "test/util";

describe("main.ts", () => {
  it("should export its members", () => {
    expect(transformer).toBeDefined();
  });
  it("should ignore non vue templates", () => {
    const source = "const x = { notATemplate: '<div />' };";
    const target = "const x = { notATemplate: '<div />' };";
    expectTranspile(source).toEqual(target);
  });
  it("should transpile vue templates", () => {
    const source = "const x = { template: '<div />' };";
    const target = `const x = { render() { const _with = this; return _with._c("div"); } };`;
    expectTranspile(source).toEqual(target);
  });
});
