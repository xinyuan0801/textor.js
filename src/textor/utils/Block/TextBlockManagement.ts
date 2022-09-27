import { ITextBlockContent, TEXT_STYLE_ACTION, TEXT_TYPE } from "../../interfaces/TextBlockInterfaces";
import {basicDeepClone} from "./EditorBlockManagement";

/**
 * convert text to avoid replacement character
 * @param textContent
 */
const normalTextConverter = (textContent: string): string => {
  return textContent
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", `"`)
    .replaceAll("&apos;", "'");
};

/**
 * return true if content in contentStart and contentEnd are being selected
 * @param contentStart
 * @param contentEnd
 * @param selectionStart
 * @param selectionEnd
 */
function checkInSelection(
  contentStart: number,
  contentEnd,
  selectionStart: number,
  selectionEnd: number
) {
  return (
    (contentStart <= selectionStart &&
      contentEnd <= selectionEnd &&
      contentEnd - 1 >= selectionStart) ||
    (selectionStart <= contentStart && selectionEnd >= contentEnd) ||
    (selectionStart <= contentStart &&
      selectionEnd - 1 >= contentStart &&
      selectionEnd <= contentEnd) ||
    (contentStart <= selectionStart && contentEnd >= selectionEnd)
  );
}

/**
 * return block content with newText in textContents form with newType
 * @param parentContent
 * @param newText
 * @param newType
 */
function generateNewContent(
  parentContent: ITextBlockContent,
  newText: string,
  newType?: TEXT_STYLE_ACTION
) {
  const newContent: ITextBlockContent = {
    textContent: newText,
    textType: TEXT_TYPE.normal,
    isMarked: parentContent.isMarked,
    isBold: parentContent.isBold,
    isUnderline: parentContent.isUnderline,
    headingSize: parentContent.headingSize,
  };
  if (newType === undefined) {
    return newContent;
  }
  if (newType === TEXT_STYLE_ACTION.bold) {
    newContent.isBold = true;
  } else if (newType === TEXT_STYLE_ACTION.marked) {
    newContent.isMarked = true;
  } else if (newType === TEXT_STYLE_ACTION.unbold) {
    newContent.isBold = false;
  } else if (newType === TEXT_STYLE_ACTION.unmarked) {
    newContent.isMarked = false;
  } else if (newType === TEXT_STYLE_ACTION.underline) {
    newContent.isUnderline = true;
  } else if (newType === TEXT_STYLE_ACTION.removeUnderline) {
    newContent.isUnderline = false;
  }
  return newContent;
}

/**
 * return the first target block content that has overlap with startIndex
 * @param startIndex
 * @param blockContents
 * @param isInsert
 */
function findFirstContent(
  startIndex: number,
  blockContents: ITextBlockContent[],
  isInsert?: boolean
): {
  firstContentIndex: number;
  firstContentStart: number;
} {
  let firstContentStart = 0;
  let firstContentIndex = 0;
  const flag = isInsert ? 0 : 1;
  for (let i = 0; i < blockContents.length; i++) {
    const currentContentEnd =
      firstContentStart + blockContents[i].textContent.length;
    if (
      firstContentStart <= startIndex &&
      startIndex <= currentContentEnd - flag
    ) {
      firstContentIndex = i;
      return { firstContentIndex, firstContentStart };
    }
    firstContentStart += blockContents[i].textContent.length;
  }
  return { firstContentIndex: -1, firstContentStart: -1 };
}

function checkSameContentType(content: ITextBlockContent, targetContent: ITextBlockContent): boolean{
  if (!content || !targetContent) {
    return true;
  }
  return content.isBold === targetContent.isBold && content.isMarked === targetContent.isMarked && content.isUnderline === targetContent.isUnderline;
}

function mergeContent(content: ITextBlockContent, targetContent: ITextBlockContent): ITextBlockContent {
  const cloneContent: ITextBlockContent = basicDeepClone(content);
  cloneContent.textContent = cloneContent.textContent + targetContent.textContent;
  return cloneContent;
}

export {
  normalTextConverter,
  generateNewContent,
  findFirstContent,
  checkInSelection,
  checkSameContentType,
  mergeContent
};
