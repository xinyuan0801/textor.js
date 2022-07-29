import React, { useEffect, useState } from "react";
import "../style/Block.css";
import { getSelectionCharacterOffsetWithin } from "../controller/Cursor/utilts";
import debounce from "lodash/debounce";
import { CursorPos } from "../controller/Cursor/ICursorManager";
import { blockContent, TEXT_TYPE } from "../controller/Block/IEditorBlock";
import { EditorBlock } from "../controller/Block/EditorBlock";
import { EditorContainer } from "../controller/Container/EditorContainer";
import { TextBlock } from "../controller/Block/TextBlock";
import { ISelectedBlock } from "../controller/Container/IEditorContainer";
import { safeJSONParse } from "../controller/Block/utils";

const Block = React.memo((props) => {
  const {
    blockInfo,
    containerInfo,
    syncState,
  }: {
    blockInfo: EditorBlock;
    containerInfo: EditorContainer;
    syncState: any;
  } = props;
  const [blockContents, setBlockContents]: [
    blockContents: blockContent[],
    setBlockContents: any
  ] = useState<blockContent[]>(blockInfo.getContents());

  useEffect(() => {
    blockInfo.setFocused(CursorPos.end);
    blockInfo.setContentSetter(setBlockContents);
  }, []);

  useEffect(() => {});

  const savingBlockContent = (e) => {
    blockInfo.sync(e);
    console.log(
      "saving",
      blockInfo.getContents(),
      (blockInfo as TextBlock).history
    );
  };

  const debounceSave = debounce(savingBlockContent, 0);
  const debounceRecordHistory = debounce(
    (blockInfo as TextBlock).recordHistory.bind(blockInfo),
    500
  );

  const collectRef = (el) => {
    if (el) {
      blockInfo.setRef(el);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      e.preventDefault();
      const targetIndex: number = containerInfo.getBlockIndex(
        blockInfo.getKey()
      );
      containerInfo.insertBlock(targetIndex + 1);
      syncState(containerInfo.getBlocks());
    } else if (e.code === "Backspace" && blockInfo.ref.innerHTML === "") {
      e.preventDefault();
      const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
      const nextFocusedBlockIndex =
        selfIndex === 0 ? selfIndex + 1 : selfIndex - 1;
      containerInfo.deleteBlock(blockInfo.getKey());
      syncState(containerInfo.getBlocks());
      if (containerInfo.getBlocks().length !== 0) {
        containerInfo.setFocusByIndex(nextFocusedBlockIndex, CursorPos.end);
      }
    } else if (e.code === "Backspace") {
      const caretPos = getSelectionCharacterOffsetWithin(e.target);
      const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
      if (caretPos.start === 0 && selfIndex !== 0) {
        e.preventDefault();
        const prevBlock = containerInfo.getBlocks()[selfIndex - 1];
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
      debounceSave(blockInfo.ref);
    } else if (e.code === "ArrowDown") {
      const caretPos = getSelectionCharacterOffsetWithin(e.target);
      const contentLength = blockInfo.getTotalSum();
      if (caretPos.end === contentLength) {
        e.preventDefault();
        const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
        if (selfIndex < containerInfo.getBlocks().length - 1) {
          containerInfo.setFocusByIndex(selfIndex + 1, CursorPos.start);
        }
      }
    } else if (e.code === "ArrowUp") {
      const caretPos = getSelectionCharacterOffsetWithin(e.target);
      if (caretPos.start === 0) {
        e.preventDefault();
        const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
        if (selfIndex > 0) {
          containerInfo.setFocusByIndex(selfIndex - 1, CursorPos.end);
        }
      }
    } else if (e.code === "KeyZ" && e.metaKey && e.shiftKey) {
      e.preventDefault();
      (blockInfo as TextBlock).redoHistory();
      blockInfo.setKey(Date.now());
      syncState(containerInfo.getBlocks());
    } else if (e.code === "KeyZ" && e.metaKey) {
      e.preventDefault();
      (blockInfo as TextBlock).undoHistory();
      blockInfo.setKey(Date.now());
      syncState(containerInfo.getBlocks());
    }
  };

  const handleOnInput = () => {
    savingBlockContent(blockInfo.ref);
    debounceRecordHistory();
  };

  const parseBlockContent = (
    content: blockContent,
    index: number
  ): HTMLElement | string => {
    if (content.textType === TEXT_TYPE.normal) {
      let baseElement = content.textContent;
      baseElement = content.isUnderline ? (
        <u key={Date.now() * Math.random() + "underline"}>{baseElement}</u>
      ) : (
        baseElement
      );
      baseElement = content.isBold ? (
        <b key={Date.now() * Math.random() + "bold"}>{baseElement}</b>
      ) : (
        baseElement
      );
      baseElement = content.isMarked ? (
        <mark key={Date.now() * Math.random() + "marked"}>{baseElement}</mark>
      ) : (
        baseElement
      );
      return baseElement;
    } else if (content.textType === TEXT_TYPE.link) {
      return (
        <a
          href={content.linkHref}
          contentEditable={false}
          key={Date.now() + index}
        >
          {content.textContent}
        </a>
      );
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
    const copiedContent = (blockInfo as TextBlock).copySelectedText(
      caretPos.start,
      caretPos.end
    );
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
    if (plainText === containerClipboard?.plainText) {
      e.preventDefault();
      const caretPos = getSelectionCharacterOffsetWithin(blockInfo.getRef());
      const contentText = containerClipboard.textContext;
      const pasteContent = safeJSONParse(contentText);
      if (pasteContent && pasteContent.key === "lovetiktok") {
        (blockInfo as TextBlock).insertBlockContents(
          pasteContent.textContent,
          caretPos.start
        );
        blockInfo.setKey(Date.now());
        syncState(containerInfo.getBlocks());
      } else {
        const newPlainContent: blockContent[] = [
          { textContent: contentText, textType: TEXT_TYPE.normal },
        ];
        (blockInfo as TextBlock).insertBlockContents(
          newPlainContent,
          caretPos.start
        );
        blockInfo.setKey(Date.now());
        syncState(containerInfo.getBlocks());
      }
    }
    (blockInfo as TextBlock).recordHistory();
  };

  return (
    <div
      className="block-container"
      contentEditable={true}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseUp={handleTextSelection}
      onPaste={handlePaste}
      onCopy={handleCopy}
      onInput={handleOnInput}
      suppressContentEditableWarning={true}
      ref={(el) => collectRef(el)}
    >
      {blockContents.map(parseBlockContent)}
    </div>
  );
});

export { Block };
