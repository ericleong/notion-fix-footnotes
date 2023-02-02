import { findFootnote } from "./util";

test("parse empty string", () => {
  expect(findFootnote("")).toBeNull();
});

test("parse only number", () => {
  expect(findFootnote("5")).toBe("5");
});

test("parse only letter", () => {
  expect(findFootnote("a")).toBeNull();
});

test("parse no footnote after period", () => {
  expect(findFootnote("no footnote after period.")).toBeNull();
});

test("parse no footnote after no period", () => {
  expect(findFootnote("no footnote after period")).toBeNull();
});

test("parse footnote after no period", () => {
  expect(findFootnote("no footnote after period28")).toBe("28");
});

test("parse footnote after period", () => {
  expect(findFootnote("footnote after period.2")).toBe("2");
});

test("parse footnote after multiple periods", () => {
  expect(findFootnote("first sentence. footnote after period.7")).toBe("7");
});

test("parse footnote after multiple periods, multiple footnotes", () => {
  expect(findFootnote("first sentence.6 footnote after period.7")).toBe("7");
});

test("parse large footnote after period", () => {
  expect(findFootnote("footnote after period.127")).toBe("127");
});

test("parse no footnote after period with space", () => {
  expect(findFootnote("no footnote after period. ")).toBeNull();
});

test("parse footnote after period with space", () => {
  expect(findFootnote("footnote after period. 3")).toBe("3");
});

test("parse large footnote after period with space", () => {
  expect(findFootnote("large footnote after period. 74")).toBe("74");
});

test("parse no footnote after quote", () => {
  expect(findFootnote("“no footnote after quote.”")).toBeNull();
});

test("parse footnote after quote", () => {
  expect(findFootnote("“footnote after quote.”31")).toBe("31");
});

test("parse footnote after quote with space", () => {
  expect(findFootnote("“footnote after quote.” 53")).toBe("53");
});

test("parse no footnote after ellipsis", () => {
  expect(findFootnote("no footnote after ellipsis…")).toBeNull();
});

test("parse footnote after ellipsis", () => {
  expect(findFootnote("footnote after ellipsis…2")).toBe("2");
});

test("parse no footnote after question", () => {
  expect(findFootnote("no footnote after question?")).toBeNull();
});

test("parse large footnote after question", () => {
  expect(findFootnote("footnote after question?53")).toBe("53");
});
