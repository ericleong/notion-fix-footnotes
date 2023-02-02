/**
 * Searches for a footnote number at the end of a string.
 *
 * @param content the string to search
 * @returns the footnote number
 */
export function findFootnote(content: string) {
  var footnote = null;

  for (var i = content.length - 1; i >= 0; i--) {
    const rtext = content.slice(i);
    if (
      parseInt(rtext, 10) > 0 &&
      (footnote == null || parseInt(rtext, 10) > parseInt(footnote, 10))
    ) {
      footnote = rtext;
    } else {
      break;
    }
  }

  return footnote;
}
