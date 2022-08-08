import React, { useEffect, useRef } from "react";
import "../style/Block.css";
import { getSelectionCharacterOffsetWithin } from "../controller/Cursor/utilts";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual"
import { CursorPos } from "../controller/Cursor/interfaces";
import {
  ITextBlockContent,
  TEXT_BLOCK_ACTION,
  TEXT_TYPE,
} from "../controller/Block/TextBlock/interfaces";
import { EditorBlock } from "../controller/Block/EditorBlock/EditorBlock";
import { EditorContainer } from "../controller/Container/EditorContainer";
import { TextBlock } from "../controller/Block/TextBlock/TextBlock";
import { ISelectedBlock } from "../controller/Container/interfaces";
import { safeJSONParse } from "../controller/Block/utils";
import {
  BLOCK_TYPE,
  IEditorBlock,
} from "../controller/Block/EditorBlock/interfaces";
import {
  HeadingBlock,
  HeadingTypeCode,
} from "../controller/Block/TextBlock/HeadingBlock";
import { ListBlock } from "../controller/Block/ListBlock/ListBlock";

const Block = React.memo((props) => {
  const {
    blockInfo,
    containerInfo,
    syncState,
  }: {
    blockInfo: EditorBlock;
    containerInfo: EditorContainer;
    syncState: (HTMLElement) => void;
  } = props;

  const compositionInput = useRef<boolean>(false);

  useEffect(() => {
    blockInfo.setFocused(CursorPos.end);
  }, []);

  useEffect(() => {});

  const savingBlockContent = (e) => {
    if (!compositionInput.current) {
      const newContents = blockInfo.sync(e);
      blockInfo.setContent(newContents);
      console.log("saving", newContents.slice());
    }
  };

  const debounceSave = debounce(savingBlockContent, 500);

  const debounceRecordHistory = debounce(() => {
    if (!compositionInput.current) {
      console.log("recording");
      (blockInfo as TextBlock).recordHistory.bind(blockInfo)();
    }
  }, 500);

  const collectRef = (el) => {
    if (el) {
      blockInfo.setRef(el);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
  };

  const handleEnterPressed = (e: KeyboardEvent) => {
    savingBlockContent(blockInfo.ref);
    if (blockInfo.getType() === BLOCK_TYPE.list) {
      const caretPos = getSelectionCharacterOffsetWithin(e.target);
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
          e.preventDefault();
          // avoid cases when a newly list block is made
          if (listElements.length === 1) {
            containerInfo.deleteBlock(blockInfo.getKey());
          } else {
            listBlock.setContent(
              listElements.slice(0, listElements.length - 1)
            );
            listBlock.setKey(Date.now() * Math.random());
          }
          const targetIndex: number = containerInfo.getBlockIndex(
            blockInfo.getKey()
          );
          containerInfo.insertBlock(targetIndex + 1);
          syncState(containerInfo.getBlocks());
        } else {
          // save state before new list element created and immediately after
          blockInfo.recordHistory(
            listElements.slice(0, listElements.length - 1)
          );
        }
      }
      blockInfo.recordHistory();
    } else {
      e.preventDefault();
      const targetIndex: number = containerInfo.getBlockIndex(
        blockInfo.getKey()
      );
      containerInfo.insertBlock(targetIndex + 1);
      syncState(containerInfo.getBlocks());
    }
  };

  const handleBlockBackspaceRemove = (e: KeyboardEvent) => {
    console.log("doing removal");
    e.preventDefault();
    savingBlockContent(blockInfo.ref);
    containerInfo.deleteBlock(blockInfo.getKey());
    syncState(containerInfo.getBlocks());
    // change focus if there are blocks left
    if (containerInfo.getBlocks().length !== 0) {
      const selfIndex = containerInfo.getBlockIndex(blockInfo.getKey());
      // if there are upper block, set focus on that after removal, if not, set focus on lower one;
      const nextFocusedBlockIndex =
        selfIndex === 0 ? selfIndex + 1 : selfIndex - 1;
      containerInfo.setFocusByIndex(nextFocusedBlockIndex, CursorPos.end);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // handle enter key action
    if (e.code === "Enter") {
      handleEnterPressed(e);
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
        if (textBlock.getPrevAction() === TEXT_BLOCK_ACTION.input) {
          console.log("prev input save");
          savingBlockContent(blockInfo.getRef());
          if (!isEqual(blockInfo.getContents(), blockInfo.getCurrEra().val)) {
            console.log("is not the same!!!!!!!!!!!!!!!!!!!!!!");
            textBlock.recordHistory();
          } else {
            debounceSave(blockInfo.getRef());
            debounceRecordHistory();
          }
        }
        textBlock.setPrevAction(TEXT_BLOCK_ACTION.delete);
      }
      // move block up when backspace at start of a non-empty block
      if (caretPos.start === 0 && selfIndex !== 0) {
        e.preventDefault();
        savingBlockContent(blockInfo.ref);
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
      savingBlockContent(blockInfo.ref);
      (blockInfo as TextBlock).redoHistory();
      blockInfo.setKey(Date.now());
      syncState(containerInfo.getBlocks());
    }
    // undo
    else if (e.code === "KeyZ" && e.metaKey) {
      e.preventDefault();
      savingBlockContent(blockInfo.ref);
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
      console.log("in here >???>")
      if (
        blockInfo.getType() === BLOCK_TYPE.text ||
        blockInfo.getType() === BLOCK_TYPE.heading ||
        blockInfo.getType() === BLOCK_TYPE.list
      ) {
        (blockInfo as TextBlock).setPrevAction(TEXT_BLOCK_ACTION.input);
      }
      debounceSave(blockInfo.ref);
      debounceRecordHistory();
    }
  };

  const parseTextBlockContents = (
    contents: ITextBlockContent[]
  ): HTMLElement[] => {
    return contents.map((content: ITextBlockContent, index: number) => {
      // no annotation support for link text
      if (content.linkHref) {
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
    });
  };

  const parseHeadingBlockContents = (
    contents: ITextBlockContent[]
  ): HTMLElement[] | undefined => {
    const headingBlockInfo = blockInfo as HeadingBlock;
    const headingContent = contents[0];
    const baseElement = headingContent.textContent;
    const headingSize = headingBlockInfo.getHeadingType();
    if (headingSize === HeadingTypeCode.one) {
      return (
        <h1 key={Date.now() * Math.random() + "heading1"}>{baseElement}</h1>
      );
    } else if (headingSize === HeadingTypeCode.two) {
      return (
        <h2 key={Date.now() * Math.random() + "heading1"}>{baseElement}</h2>
      );
    } else if (headingSize === HeadingTypeCode.three) {
      return (
        <h3 key={Date.now() * Math.random() + "heading1"}>{baseElement}</h3>
      );
    }
  };

  const parseListElement = (content: ITextBlockContent[], index: number) => {
    return <li key={Date.now() + index}>{parseTextBlockContents(content)}</li>;
  };

  const parseListBlock = (
    listContents: ITextBlockContent[][]
  ): HTMLElement[] | undefined => {
    return <ul>{listContents.map(parseListElement)}</ul>;
  };

  const parseBlockContent = (
    blockInfo: IEditorBlock
  ): HTMLElement[] | string[] => {
    const blockType = blockInfo.getType();
    if (blockType === BLOCK_TYPE.text) {
      const textBlockContent = (blockInfo as TextBlock).getContents();
      return parseTextBlockContents(textBlockContent);
    } else if (blockType === BLOCK_TYPE.heading) {
      const headingBlockContent = (blockInfo as HeadingBlock).getContents();
      return parseHeadingBlockContents(headingBlockContent);
    } else if (blockType === BLOCK_TYPE.list) {
      const listContents = (blockInfo as ListBlock).getContents();
      return parseListBlock(listContents);
    }
  };

  const handleTextSelection = () => {
    const caretPos = getSelectionCharacterOffsetWithin(blockInfo.getRef());
    console.log(caretPos);
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
    const copiedContent = (blockInfo as TextBlock).copyContent(
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
      const pasteContent: { key: string; textContent: ITextBlockContent[] } =
        safeJSONParse(contentText);
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
    }
    (blockInfo as TextBlock).recordHistory();
  };

  const handleCompositionStart = () => {
    compositionInput.current = true;
  };

  const handleCompositionEnd = () => {
    compositionInput.current = false;
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
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      suppressContentEditableWarning={true}
      ref={(el) => collectRef(el)}
    >
      {parseBlockContent(blockInfo)}
    </div>
  );
});

export { Block };
