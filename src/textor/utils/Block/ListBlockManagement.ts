import { ITextBlockContent } from "../../interfaces/TextBlockInterfaces";

/**
 * return the first target block content when marking text
 * @param blockContents
 * @param startIndex
 */
function findMarkedListElement(
  blockContents: ITextBlockContent[][],
  startIndex: number
): { targetContentStartIndex: number; targetIndex: number } {
  let currentStartIndex = 0;
  let targetIndex = 0;
  let targetContentStartIndex = 0;
  blockContents.forEach((content, index) => {
    const currentEndIndex = currentStartIndex + getListElementLength(content);
    if (currentStartIndex <= startIndex && currentEndIndex > startIndex) {
      targetIndex = index;
      targetContentStartIndex = currentStartIndex;
    }
    currentStartIndex = currentEndIndex;
  });
  return { targetIndex, targetContentStartIndex };
}

/**
 * get length of a single list element
 * @param listContent
 */
function getListElementLength(listContent: ITextBlockContent[]) {
  let count = 0;
  listContent.forEach((content) => {
    count += content.textContent.length;
  });
  return count;
}

export { findMarkedListElement, getListElementLength };
