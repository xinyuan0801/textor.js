import {getSelectionCharacterOffsetWithin} from "../../textor/utils/CursorManagement";
import {BLOCK_TYPE} from "../../textor/interfaces/EditorBlockInterfaces";
import {TextBlock} from "../../textor/Block/TextBlock/TextBlock";
import {ITextBlockContent, TEXT_BLOCK_ACTION, TEXT_TYPE} from "../../textor/interfaces/TextBlockInterfaces";
import {CursorPosEnum} from "../../textor/interfaces/CursorInterfaces";
import debounce from "lodash/debounce";
import {safeJSONParse} from "../../textor/utils/Block/BlockManagement";
import {ISelectedBlock} from "../../textor/interfaces/EditorContainerInterfaces";
import {ListBlock} from "../../textor/Block/ListBlock/ListBlock";
import {generateUniqueId} from "./UniqueId";

const savingBlockContent = (blockInfo, compositionInput) => {
  if (!compositionInput.current) {
    blockInfo.saveCurrentContent();
  }
};

const debounceSave = debounce(savingBlockContent, 500);

function handleTextBackspace(e, blockInfo, containerInfo, compositionInput, syncState) {
  const caretPos = getSelectionCharacterOffsetWithin(e.target);
  const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
  if (
    blockInfo.getType() === BLOCK_TYPE.TEXT ||
    blockInfo.getType() === BLOCK_TYPE.HEADING ||
    blockInfo.getType() === BLOCK_TYPE.LIST
  ) {
    const textBlock = blockInfo as TextBlock;
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
      prevBlock.setContent([
        ...prevBlock.getContents(),
        ...curBlockContent,
      ]);
      // force rerender the block component to avoid virtual dom diff problem with text node
      prevBlock.setKey(generateUniqueId());
      prevBlock.setFocused(CursorPosEnum.END);
      containerInfo.deleteBlockByKey(blockInfo.getKey());
    }
    syncState(containerInfo.getBlocks());
  }
}

function handleTextCopy(blockInfo, containerInfo) {
  const nativeCopy = blockInfo.getNativeCopy();
  if (!nativeCopy) {
    const plainText = window.getSelection().toString();
    const caretPos = getSelectionCharacterOffsetWithin(blockInfo.getRef());
    const copiedContent = blockInfo.copyContent(caretPos.start, caretPos.end);
    const copyTextInfo = { textContent: copiedContent, key: "lovetiktok" };
    const copyTextInfoJsonString = JSON.stringify(copyTextInfo);
    containerInfo.setClipboardInfo({
      plainText,
      textContext: copyTextInfoJsonString,
    });
  } else {
    containerInfo.setClipboardInfo(null);
  }
}

function handleTextBlur(blockInfo, compositionInput) {
  if (!compositionInput.current) {
    blockInfo.saveCurrentContent();
  }
  if ((blockInfo as TextBlock).getPrevAction() !== TEXT_BLOCK_ACTION.origin) {
    blockInfo.recordHistory();
    console.log("recording");
    (blockInfo as TextBlock).setPrevAction(TEXT_BLOCK_ACTION.origin);
  }
}

function handleTextPaste(e, blockInfo, containerInfo, syncState) {
  const plainText = e.clipboardData.getData("Text");
  const containerClipboard = containerInfo.getClipboardInfo();
  e.preventDefault();
  const caretPos = getSelectionCharacterOffsetWithin(blockInfo.getRef());
  const contentText = containerClipboard?.textContext || plainText;
  const pasteContent: { key: string; textContent: ITextBlockContent[] } =
    safeJSONParse(contentText) || {};
  if (pasteContent && pasteContent.key === "lovetiktok") {
    console.log("custom copy");
    (blockInfo as TextBlock).insertBlockContents(
      pasteContent.textContent,
      caretPos.start
    );
    blockInfo.setKey(generateUniqueId());
    syncState(containerInfo.getBlocks());
  } else {
    const newPlainContent: ITextBlockContent[] = [
      { textContent: contentText, textType: TEXT_TYPE.normal },
    ];
    (blockInfo as TextBlock).insertBlockContents(
      newPlainContent,
      caretPos.start
    );
    blockInfo.setKey(generateUniqueId());
    syncState(containerInfo.getBlocks());
  }
}

const handleTextSelection = (blockInfo, containerInfo) => {
  const caretPos = getSelectionCharacterOffsetWithin(blockInfo.getRef());
  if (caretPos.start !== caretPos.end) {
    const selectedBlockInfo: ISelectedBlock = {
      blockKey: blockInfo.getKey(),
      selectionStart: caretPos.start,
      selectionEnd: caretPos.end,
    };
    containerInfo.setCurrentSelectedBlock(selectedBlockInfo);
  }
};

const handleEnterPressed = (e: KeyboardEvent, containerInfo, blockInfo, syncState, compositionInput) => {
    if (blockInfo.getType() === BLOCK_TYPE.LIST) {
      handleListEnterPressed(e, blockInfo, containerInfo, syncState);
    } else {
      e.preventDefault();
      if (!compositionInput.current) {
        blockInfo.saveCurrentContent();
      }
      console.log("cross");
      const targetIndex: number = containerInfo.getBlockIndex(
        blockInfo.getKey()
      );
      const defaultBlock = new TextBlock(generateUniqueId(), BLOCK_TYPE.TEXT, []);
      containerInfo.insertBlock(targetIndex + 1, defaultBlock);
      syncState(containerInfo.getBlocks());
    }
};

const handleBlockBackspaceRemove = (e: KeyboardEvent, containerInfo, blockInfo, syncState) => {
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

function handleTextKeyDown(e, blockInfo, containerInfo, compositionInput, syncState) {
  // handle enter key action
  if (e.code === "Enter" && !compositionInput.current) {
    handleEnterPressed(e, containerInfo, blockInfo, syncState, compositionInput);
  } else if (e.code === "Backspace" && blockInfo.isEmpty()) {
    handleBlockBackspaceRemove(e, containerInfo, blockInfo, syncState);
  }
  // normal backspace
  else if (e.code === "Backspace") {
    const caretPos = getSelectionCharacterOffsetWithin(e.target);
    const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
    if (
      blockInfo.getType() === BLOCK_TYPE.TEXT ||
      blockInfo.getType() === BLOCK_TYPE.HEADING ||
      blockInfo.getType() === BLOCK_TYPE.LIST
    ) {
      const textBlock = blockInfo as TextBlock;
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
    }
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
        prevBlock.setContent([
          ...prevBlock.getContents(),
          ...curBlockContent,
        ]);
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
    const contentLength = (blockInfo as TextBlock).getTotalContentLength();
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
    if (
      (blockInfo as TextBlock).getPrevAction() !== TEXT_BLOCK_ACTION.origin
    ) {
      blockInfo.saveCurrentContent();
      blockInfo.recordHistory();
    }
    (blockInfo as TextBlock).setPrevAction(TEXT_BLOCK_ACTION.origin);
    blockInfo.undoHistory();
    blockInfo.setKey(generateUniqueId());
    syncState(containerInfo.getBlocks());
  }
  // shortcuts for selection
  else if (
    (e.metaKey || e.altKey) &&
    e.shiftKey &&
    (e.code === "ArrowLeft" || e.code === "ArrowRight")
  ) {
    setTimeout(() => {
      handleTextSelection(blockInfo, containerInfo);
    }, 100);
  }
  // only activate when character is input
  else if (/^.$/u.test(e.key)) {
    if (
      blockInfo.getType() === BLOCK_TYPE.TEXT ||
      blockInfo.getType() === BLOCK_TYPE.HEADING ||
      blockInfo.getType() === BLOCK_TYPE.LIST
    ) {
      // new type of action happened, record current state for undo redo
      if (
        (blockInfo as TextBlock).getPrevAction() === TEXT_BLOCK_ACTION.delete
      ) {
        blockInfo.saveCurrentContent();
        (blockInfo as TextBlock).recordHistory();
      }
      (blockInfo as TextBlock).setPrevAction(TEXT_BLOCK_ACTION.input);
    }
    debounceSave(blockInfo, compositionInput);
  }
}

const handleListEnterPressed = (e: KeyboardEvent, blockInfo, containerInfo, syncState) => {
  blockInfo.saveCurrentContent();
  const caretPos = getSelectionCharacterOffsetWithin(e.target);
  console.log(caretPos);
  // press enter at end of a list element
  if (
    caretPos.start === caretPos.end &&
    caretPos.start === (blockInfo as ListBlock).getTotalContentLength()
  ) {
    const listBlock = blockInfo as ListBlock;
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
      const defaultBlock = new TextBlock(generateUniqueId(), BLOCK_TYPE.TEXT, []);
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

export {handleTextBackspace, handleTextCopy, handleTextBlur, handleTextPaste, handleTextSelection, handleTextKeyDown}
