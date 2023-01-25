import {
  ITextBlockContent,
  TEXT_BLOCK_ACTION,
} from "../../text/text-block-interfaces";
import { getSelectionCharacterOffsetWithin } from "../../../textor-core/utils/cursor-management";
import { BLOCK_TYPE } from "../../../textor-core/interfaces/editor-block";
import { CursorPosEnum } from "../../../textor-core/interfaces/cursor";
import { generateUniqueId } from "../../../utils/unique-id";
import debounce from "lodash/debounce";

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

const handleListEnterPressed = (
  e: KeyboardEvent,
  blockInfo,
  containerInfo,
  syncState
) => {
  blockInfo.saveCurrentContent();
  const caretPos = getSelectionCharacterOffsetWithin(e.target);
  console.log(caretPos);
  // press enter at end of a list element
  if (
    caretPos.start === caretPos.end &&
    caretPos.start === blockInfo.getTotalContentLength()
  ) {
    const listBlock = blockInfo;
    const listElements = listBlock.getContents();
    const lastListElement = listElements[listElements.length - 1];
    // if last list element is empty and hit enter again, jump out of list block
    if (
      lastListElement.length === 0 ||
      (lastListElement.length === 1 &&
        lastListElement[0].textContent.length === 0)
    ) {
      console.log("special action");
      e.preventDefault();
      // avoid cases when a newly list block is made
      if (listElements.length === 1) {
        containerInfo.deleteBlockByKey(blockInfo.getKey());
      } else {
        listBlock.setContent(listElements.slice(0, listElements.length - 1));
        listBlock.setKey(generateUniqueId());
      }
      const targetIndex: number = containerInfo.getBlockIndex(
        blockInfo.getKey()
      );
      const defaultBlockConstructor = containerInfo.getDefaultBlock();
      const defaultBlock = new defaultBlockConstructor(
        [generateUniqueId()],
        [],
        [BLOCK_TYPE.TEXT, []]
      );
      containerInfo.insertBlock(targetIndex + 1, defaultBlock);
      syncState(containerInfo.getBlocks());
    }
    // follow native behaviour when enter create a new list element
    else {
      // record state for list block before a new list element if created
      blockInfo.recordHistory(listElements.slice(0, listElements.length - 1));
    }
  }
  blockInfo.recordHistory();
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

const savingBlockContent = (blockInfo, compositionInput) => {
  if (!compositionInput.current) {
    blockInfo.saveCurrentContent();
  }
};

const debounceSave = debounce(savingBlockContent, 500);

function handleTextKeyDown(
  e,
  blockInfo,
  containerInfo,
  compositionInput,
  syncState
) {
  // handle enter key action
  if (e.code === "Enter" && !compositionInput.current) {
    handleListEnterPressed(e, blockInfo, containerInfo, syncState);
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
    debounceSave(blockInfo, compositionInput);
  }
}

export { findMarkedListElement, getListElementLength, handleTextKeyDown };
