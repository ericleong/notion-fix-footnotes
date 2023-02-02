/**
 * Searches for a footnote number at the end of a string.
 *
 * @param content the string to search
 * @returns
 */
export function findFootnote(content: string) {
  var footnote: string | null = content.substring(content.lastIndexOf(".") + 1);

  if (!(parseInt(footnote, 10) > 0)) {
    if (content.length - content.lastIndexOf("”") < 5) {
      footnote = parseInt(
        content.substring(content.lastIndexOf("”") + 1)
      ).toString();
    } else if (content.lastIndexOf("…") >= 0) {
      footnote = parseInt(
        content.substring(content.lastIndexOf("…") + 1)
      ).toString();
    } else if (content.lastIndexOf("?") >= 0) {
      footnote = parseInt(
        content.substring(content.lastIndexOf("?") + 1)
      ).toString();
    } else {
      footnote = null;
    }
  }

  return footnote;
}
