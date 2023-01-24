import { getSelectionCharacterOffsetWithin } from "../../../textor/utils/CursorManagement";
import { BLOCK_TYPE } from "../../../textor/interfaces/EditorBlockInterfaces";
import { TEXT_BLOCK_ACTION } from "../TextBlockInterfaces";
import { CursorPosEnum } from "../../../textor/interfaces/CursorInterfaces";
import debounce from "lodash/debounce";
import { generateUniqueId } from "../../../utils/UniqueId";

const savingBlockContent = (blockInfo, compositionInput) => {
  if (!compositionInput.current) {
    blockInfo.saveCurrentContent();
  }
};

const debounceSave = debounce(savingBlockContent, 500);

function handleTextBackspace(
  e,
  blockInfo,
  containerInfo,
  compositionInput,
  syncState
) {
  const caretPos = getSelectionCharacterOffsetWithin(e.target);
  const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
  if (
    blockInfo.getType() === BLOCK_TYPE.TEXT ||
    blockInfo.getType() === BLOCK_TYPE.HEADING ||
    blockInfo.getType() === BLOCK_TYPE.LIST
  ) {
    const textBlock = blockInfo;
    // if new type of action, save the current state
    if (textBlock.getPrevAction() !== TEXT_BLOCK_ACTION.delete) {
      textBlock.saveCurrentContent();
      textBlock.recordHistory();
    }
    debounceSave(blockInfo, compositionInput);
    textBlock.setPrevAction(TEXT_BLOCK_ACTION.delete);
  }
  // move block up when backspace at start of a non-empty block
  if (caretPos.start === 0 && caretPos.end === 0 && selfIndex !== 0) {
    e.preventDefault();
    savingBlockContent(blockInfo, compositionInput);
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

export { handleTextBackspace, handleTextKeyDown };
