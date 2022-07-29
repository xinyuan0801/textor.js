import {ITextBlockContent, TEXT_STYLE_ACTION, TEXT_TYPE} from "./TextBlock/ITextBlock";

interface IFirstContentInfo {
  firstContentIndex: number,
  firstContentStart: number
}

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

function generateNewContent(parentContent: ITextBlockContent, newText: string, newType?: TEXT_STYLE_ACTION) {
  const newContent: ITextBlockContent = {
    textContent: newText,
    textType: TEXT_TYPE.normal,
    isMarked: parentContent.isMarked,
    isBold: parentContent.isBold,
    isUnderline: parentContent.isUnderline,
  };
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
  if (!newType) {
    return newContent;
  }
  return newContent;
}

function findFirstContent(startIndex: number, blockContents: ITextBlockContent[], isInsert?: boolean): IFirstContentInfo {
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
      return {firstContentIndex, firstContentStart};
    }
    firstContentStart += blockContents[i].textContent.length;
  }
  return {firstContentIndex: -1, firstContentStart: -1};
}

function safeJSONParse(JSONString: string) {
  try {
    return JSON.parse(JSONString);
  } catch (e) {
    console.error("error");
    return false;
  }
}

function blockContentDeepClone(blockContents: ITextBlockContent[]) {
  return safeJSONParse(JSON.stringify(blockContents));
}

export { checkInSelection, generateNewContent, findFirstContent, safeJSONParse, blockContentDeepClone };
