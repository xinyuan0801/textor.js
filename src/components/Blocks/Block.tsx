import React, { useEffect, useRef } from "react";
import "../../style/Block.css";
import { getSelectionCharacterOffsetWithin } from "../../controller/Cursor/utilts";
import debounce from "lodash/debounce";
import { CursorPos } from "../../controller/Cursor/interfaces";
import {
  ITextBlockContent,
  TEXT_BLOCK_ACTION,
  TEXT_TYPE,
} from "../../controller/Block/TextBlock/interfaces";
import { EditorBlock } from "../../controller/Block/EditorBlock/EditorBlock";
import { EditorContainer } from "../../controller/Container/EditorContainer";
import { TextBlock } from "../../controller/Block/TextBlock/TextBlock";
import { ISelectedBlock } from "../../controller/Container/interfaces";
import { safeJSONParse } from "../../controller/Block/utils";
import {
  BLOCK_TYPE,
  IEditorBlock,
} from "../../controller/Block/EditorBlock/interfaces";
import {
  HeadingBlock,
  HeadingTypeCode,
} from "../../controller/Block/TextBlock/HeadingBlock";
import { ListBlock } from "../../controller/Block/ListBlock/ListBlock";

const Block = React.memo((props) => {
  const {
    blockInfo,
    containerInfo,
    syncState,
    renderContent,
    enterHandler,
    outerContentEditable = true,
  }: {
    blockInfo: EditorBlock;
    containerInfo: EditorContainer;
    syncState: (HTMLElement) => void;
    renderContent: (EditorBlock) => HTMLElement;
    enterHandler: (e: KeyboardEvent) => void;
    outerContentEditable: boolean;
  } = props;

  const compositionInput = useRef<boolean>(false);

  useEffect(() => {
    blockInfo.setFocused(CursorPos.end);
  }, []);

  const savingBlockContent = () => {
    if (!compositionInput.current) {
      blockInfo.saveCurrentContent();
    }
    console.log("saved");
  };

  const debounceSave = debounce(savingBlockContent, 500);

  const collectRef = (el) => {
    if (el) {
      blockInfo.setRef(el);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
  };

  const handleEnterPressed = (e: KeyboardEvent) => {
    if (enterHandler) {
      enterHandler(e);
    } else {
      e.preventDefault();
      savingBlockContent();
      console.log("cross");
      const targetIndex: number = containerInfo.getBlockIndex(
        blockInfo.getKey()
      );
      containerInfo.insertBlock(targetIndex + 1);
      syncState(containerInfo.getBlocks());
    }
  };

  const handleBlockBackspaceRemove = (e: KeyboardEvent) => {
    e.preventDefault();
    // change focus if there are blocks left
    if (containerInfo.getBlocks().length !== 0) {
      const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
      // if there are upper block, set focus on that after removal, if not, set focus on lower one;
      const nextFocusedBlockIndex =
        selfIndex === 0 ? selfIndex + 1 : selfIndex - 1;
      if (containerInfo.getBlocks().length !== 1) {
        containerInfo.setFocusByIndex(nextFocusedBlockIndex, CursorPos.end);
      }
    }
    containerInfo.deleteBlock(blockInfo.getKey());
    syncState(containerInfo.getBlocks());
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // handle enter key action
    if (e.code === "Enter" && !compositionInput.current) {
      handleEnterPressed(e);
    } else if (e.code === "Backspace" && blockInfo.isEmpty()) {
      handleBlockBackspaceRemove(e);
    }
    // normal backspace
    else if (e.code === "Backspace") {
      const caretPos = getSelectionCharacterOffsetWithin(e.target);
      const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
      if (
        blockInfo.getType() === BLOCK_TYPE.text ||
        blockInfo.getType() === BLOCK_TYPE.heading ||
        blockInfo.getType() === BLOCK_TYPE.list
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
        debounceSave();
        textBlock.setPrevAction(TEXT_BLOCK_ACTION.delete);
      }
      // move block up when backspace at start of a non-empty block
      if (caretPos.start === 0 && selfIndex !== 0) {
        e.preventDefault();
        savingBlockContent();
        const prevBlock = containerInfo.getBlocks()[selfIndex - 1];
        if (prevBlock.getType() !== blockInfo.getType()) {
          prevBlock.setFocused(CursorPos.end);
          return;
        }
        if (prevBlock.ref.innerHTML === "") {
          containerInfo.deleteBlock(prevBlock.getKey());
        } else {
          const curBlockContent = blockInfo.getContents();
          prevBlock.setContent([
            ...prevBlock.getContents(),
            ...curBlockContent,
          ]);
          // force rerender the block component to avoid virtual dom diff problem with text node
          prevBlock.setKey(Date.now());
          prevBlock.setFocused(CursorPos.end);
          containerInfo.deleteBlock(blockInfo.getKey());
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
          containerInfo.setFocusByIndex(selfIndex + 1, CursorPos.start);
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
          containerInfo.setFocusByIndex(selfIndex - 1, CursorPos.end);
        }
      }
    }
    // redo
    else if (e.code === "KeyZ" && e.metaKey && e.shiftKey) {
      e.preventDefault();
      savingBlockContent();
      blockInfo.redoHistory();
      blockInfo.setKey(Date.now());
      syncState(containerInfo.getBlocks());
    }
    // undo
    else if (e.code === "KeyZ" && e.metaKey) {
      e.preventDefault();
      savingBlockContent();
      if (
        (blockInfo as TextBlock).getPrevAction() !== TEXT_BLOCK_ACTION.origin
      ) {
        blockInfo.saveCurrentContent();
        blockInfo.recordHistory();
      }
      (blockInfo as TextBlock).setPrevAction(TEXT_BLOCK_ACTION.origin);
      blockInfo.undoHistory();
      blockInfo.setKey(Date.now());
      syncState(containerInfo.getBlocks());
    }
    // shortcuts for selection
    else if (
      (e.metaKey || e.altKey) &&
      e.shiftKey &&
      (e.code === "ArrowLeft" || e.code === "ArrowRight")
    ) {
      setTimeout(() => {
        handleTextSelection();
      }, 100);
    }
    // only activate when character is input
    else if (/^.$/u.test(e.key)) {
      if (
        blockInfo.getType() === BLOCK_TYPE.text ||
        blockInfo.getType() === BLOCK_TYPE.heading ||
        blockInfo.getType() === BLOCK_TYPE.list
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
      debounceSave();
    }
  };

  const handleTextSelection = () => {
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

  const handleCopy = (e: React.ClipboardEvent) => {
    const plainText = window.getSelection().toString();
    const caretPos = getSelectionCharacterOffsetWithin(blockInfo.getRef());
    const copiedContent = blockInfo.copyContent(caretPos.start, caretPos.end);
    const copyTextInfo = { textContent: copiedContent, key: "lovetiktok" };
    const copyTextInfoJsonString = JSON.stringify(copyTextInfo);
    containerInfo.setClipboardInfo({
      plainText,
      textContext: copyTextInfoJsonString,
    });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const plainText = e.clipboardData.getData("Text");
    const containerClipboard = containerInfo.getClipboardInfo();
    console.log("custom copy");
    e.preventDefault();
    const caretPos = getSelectionCharacterOffsetWithin(blockInfo.getRef());
    const contentText = containerClipboard?.textContext || plainText;
    const pasteContent: { key: string; textContent: ITextBlockContent[] } =
      safeJSONParse(contentText) || {};
    if (pasteContent && pasteContent.key === "lovetiktok") {
      (blockInfo as TextBlock).insertBlockContents(
        pasteContent.textContent,
        caretPos.start
      );
      blockInfo.setKey(Date.now());
      syncState(containerInfo.getBlocks());
    } else {
      const newPlainContent: ITextBlockContent[] = [
        { textContent: contentText, textType: TEXT_TYPE.normal },
      ];
      (blockInfo as TextBlock).insertBlockContents(
        newPlainContent,
        caretPos.start
      );
      blockInfo.setKey(Date.now());
      syncState(containerInfo.getBlocks());
    }
  };

  const handleCompositionStart = () => {
    compositionInput.current = true;
  };

  const handleCompositionEnd = () => {
    compositionInput.current = false;
  };

  const handleBlur = () => {
    savingBlockContent();
    if ((blockInfo as TextBlock).getPrevAction() !== TEXT_BLOCK_ACTION.origin) {
      blockInfo.recordHistory();
      (blockInfo as TextBlock).setPrevAction(TEXT_BLOCK_ACTION.origin);
    }
  };

  return (
    <div
      className="block-container"
      contentEditable={outerContentEditable}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseUp={handleTextSelection}
      onPaste={handlePaste}
      onCopy={handleCopy}
      onBlur={handleBlur}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      suppressContentEditableWarning={true}
      ref={(el) => collectRef(el)}
    >
      {renderContent(blockInfo)}
    </div>
  );
});

export { Block };
