import {
  ITextBlockContent,
  TEXT_BLOCK_ACTION,
  TEXT_STYLE_ACTION,
  TEXT_TYPE,
} from "../text-block-interfaces";
import { basicDeepClone } from "../../../utils/json-tool";
import { generateUniqueId } from "../../../utils/unique-id";
import { BLOCK_TYPE } from "../../../textor-core/interfaces/editor-block";
import { CursorPosEnum } from "../../../textor-core/interfaces/cursor";
import debounce from "lodash/debounce";
import { getSelectionCharacterOffsetWithin } from "../../../textor-core/utils/cursor-management";

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

const savingBlockContent = (blockInfo, compositionInput) => {
  if (!compositionInput.current) {
    blockInfo.saveCurrentContent();
  }
};

const debounceSave = debounce(savingBlockContent, 500);

/**
 * return true if content in contentStart and contentEnd are being selected
 * @param contentStart
 * @param contentEnd
 * @param selectionStart
 * @param selectionEnd
 */
function checkInSelection(
  contentStart: number,
  contentEnd: number,
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
  };
  if (parentContent.textType === TEXT_TYPE.heading) {
    newContent.headingSize = parentContent.headingSize;
  }
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

function checkSameContentType(
  content: ITextBlockContent,
  targetContent: ITextBlockContent
): boolean {
  if (!content || !targetContent) {
    return true;
  }
  return (
    content.isBold === targetContent.isBold &&
    content.isMarked === targetContent.isMarked &&
    content.isUnderline === targetContent.isUnderline
  );
}

function mergeContent(
  content: ITextBlockContent,
  targetContent: ITextBlockContent
): ITextBlockContent {
  const cloneContent: ITextBlockContent = basicDeepClone(content);
  cloneContent.textContent =
    cloneContent.textContent + targetContent.textContent;
  return cloneContent;
}

const handleEnterPressed = (
  e: KeyboardEvent,
  containerInfo,
  blockInfo,
  syncState,
  compositionInput
) => {
  e.preventDefault();
  if (!compositionInput.current) {
    blockInfo.saveCurrentContent();
  }
  const targetIndex: number = containerInfo.getBlockIndex(blockInfo.getKey());
  const defaultBlockConstructor = containerInfo.getDefaultBlock();
  const defaultBlock = new defaultBlockConstructor(
    [generateUniqueId()],
    [],
    [BLOCK_TYPE.TEXT, []]
  );
  containerInfo.insertBlock(targetIndex + 1, defaultBlock);
  syncState(containerInfo.getBlocks());
};

const handleBlockBackspaceRemove = (
  e: KeyboardEvent,
  containerInfo,
  blockInfo,
  syncState
) => {
  e.preventDefault();
  // change focus if there are blocks left
  if (containerInfo.getBlocks().length !== 0) {
    const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
    // if there are upper block, set focus on that after removal, if not, set focus on lower one;
    const nextFocusedBlockIndex =
      selfIndex === 0 ? selfIndex + 1 : selfIndex - 1;
    if (containerInfo.getBlocks().length !== 1) {
      containerInfo.setFocusByIndex(nextFocusedBlockIndex, CursorPosEnum.END);
    }
  }
  containerInfo.deleteBlockByKey(blockInfo.getKey());
  syncState(containerInfo.getBlocks());
};

function handleTextKeyDown(
  e,
  blockInfo,
  containerInfo,
  compositionInput,
  syncState
) {
  // handle enter key action
  if (e.code === "Enter" && !compositionInput.current) {
    handleEnterPressed(
      e,
      containerInfo,
      blockInfo,
      syncState,
      compositionInput
    );
  } else if (e.code === "Backspace" && blockInfo.isEmpty()) {
    handleBlockBackspaceRemove(e, containerInfo, blockInfo, syncState);
  }
  // normal backspace
  else if (e.code === "Backspace") {
    const caretPos = getSelectionCharacterOffsetWithin(e.target);
    const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
    const textBlock = blockInfo;
    // if new type of action, save the current state
    if (textBlock.getPrevAction() !== TEXT_BLOCK_ACTION.delete) {
      textBlock.saveCurrentContent();
      textBlock.recordHistory();
      // // if the content in block is different from current era, that means
      // if (!isEqual(blockInfo.getContents(), blockInfo.getCurrEra().val)) {
      //   textBlock.recordHistory();
      // }
    }
    debounceSave(blockInfo, compositionInput);
    textBlock.setPrevAction(TEXT_BLOCK_ACTION.delete);
    // move block up when backspace at start of a non-empty block
    if (caretPos.start === 0 && caretPos.end === 0 && selfIndex !== 0) {
      e.preventDefault();
      if (!compositionInput.current) {
        blockInfo.saveCurrentContent();
      }
      const prevBlock = containerInfo.getBlocks()[selfIndex - 1];
      if (prevBlock.getType() !== blockInfo.getType()) {
        prevBlock.setFocused(CursorPosEnum.END);
        return;
      }
      if (prevBlock.ref.innerHTML === "") {
        containerInfo.deleteBlockByKey(prevBlock.getKey());
      } else {
        const curBlockContent = blockInfo.getContents();
        prevBlock.setContent([...prevBlock.getContents(), ...curBlockContent]);
        // force rerender the block component to avoid virtual dom diff problem with text node
        prevBlock.setKey(generateUniqueId());
        prevBlock.setFocused(CursorPosEnum.END);
        containerInfo.deleteBlockByKey(blockInfo.getKey());
      }
      syncState(containerInfo.getBlocks());
    }
  }
  // caret movement when Arrow Down pressed
  else if (e.code === "ArrowDown") {
    const caretPos = getSelectionCharacterOffsetWithin(e.target);
    const contentLength = blockInfo.getTotalContentLength();
    if (caretPos.end === contentLength) {
      e.preventDefault();
      const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
      if (selfIndex < containerInfo.getBlocks().length - 1) {
        containerInfo.setFocusByIndex(selfIndex + 1, CursorPosEnum.START);
      }
    }
  }
  // caret movement when Arrow Up pressed
  else if (e.code === "ArrowUp") {
    const caretPos = getSelectionCharacterOffsetWithin(e.target);
    if (caretPos.start === 0) {
      e.preventDefault();
      const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
      if (selfIndex > 0) {
        containerInfo.setFocusByIndex(selfIndex - 1, CursorPosEnum.END);
      }
    }
  }
  // redo
  else if (e.code === "KeyZ" && e.metaKey && e.shiftKey) {
    e.preventDefault();
    if (!compositionInput.current) {
      blockInfo.saveCurrentContent();
    }
    blockInfo.redoHistory();
    blockInfo.setKey(generateUniqueId());
    syncState(containerInfo.getBlocks());
  }
  // undo
  else if (e.code === "KeyZ" && e.metaKey) {
    e.preventDefault();
    if (!compositionInput.current) {
      blockInfo.saveCurrentContent();
    }
    if (blockInfo.getPrevAction() !== TEXT_BLOCK_ACTION.origin) {
      blockInfo.saveCurrentContent();
      blockInfo.recordHistory();
    }
    blockInfo.setPrevAction(TEXT_BLOCK_ACTION.origin);
    blockInfo.undoHistory();
    blockInfo.setKey(generateUniqueId());
    syncState(containerInfo.getBlocks());
  }
  // only activate when character is input
  else if (/^.$/u.test(e.key)) {
    // new type of action happened, record current state for undo redo
    if (blockInfo.getPrevAction() === TEXT_BLOCK_ACTION.delete) {
      blockInfo.saveCurrentContent();
      blockInfo.recordHistory();
    }
    blockInfo.setPrevAction(TEXT_BLOCK_ACTION.input);
  }
  debounceSave(blockInfo, compositionInput);
}

function createMarkSelection(blockInstance: any, start: number, end: number) {
  const blockInfo: ITextBlockContent[] = blockInstance.getContents();
  const blockRef = blockInstance.getRef();
  const currSelection = window.getSelection();
  let newRange = new Range();
  let startNode = null;
  let startOffset = 0;
  let endNode = null;
  let endOffset = 0;
  let startValue = start;
  let endValue = end;
  for (let i = 0; i < blockInfo.length; i++) {
    if (
      startValue - blockInfo[i].textContent.length < 0 &&
      startNode === null
    ) {
      if (
        !blockInfo[i].isMarked &&
        !blockInfo[i].isBold &&
        !blockInfo[i].isUnderline
      ) {
        startNode = blockRef.childNodes[i];
        startOffset = startValue;
      } else {
        startNode = getTextNode(blockInfo[i].node);
        startOffset = startValue;
      }
    }
    if (startValue === 0 && startNode === null) {
      if (
        !blockInfo[i].isMarked &&
        !blockInfo[i].isBold &&
        !blockInfo[i].isUnderline
      ) {
        startNode = blockRef.childNodes[i];
        startOffset = startValue;
      } else {
        startNode = getTextNode(blockInfo[i].node);
        startOffset = startValue;
      }
    }
    if (endValue - blockInfo[i].textContent.length <= 0) {
      console.log("final check", blockInfo[i]);
      if (
        !blockInfo[i].isMarked &&
        !blockInfo[i].isBold &&
        !blockInfo[i].isUnderline
      ) {
        endNode = blockRef.childNodes[i];
        endOffset = endValue;
      } else {
        endNode = getTextNode(blockInfo[i].node);
        endOffset = endValue;
      }
      console.log("start", startNode, startOffset);
      console.log("bound", endNode, endOffset);
      break;
    }
    startValue -= blockInfo[i].textContent.length;
    endValue -= blockInfo[i].textContent.length;
  }
  newRange.setStart(startNode, startOffset);
  newRange.setEnd(endNode, endOffset);
  currSelection.removeAllRanges();
  currSelection.addRange(newRange);
}

function getTextNode(node): any {
  let tempNode = node;
  while (tempNode.nodeType !== 3) {
    tempNode = tempNode.childNodes[0];
  }
  return tempNode;
}

export {
  normalTextConverter,
  generateNewContent,
  findFirstContent,
  checkInSelection,
  checkSameContentType,
  mergeContent,
  handleTextKeyDown,
  createMarkSelection,
};
