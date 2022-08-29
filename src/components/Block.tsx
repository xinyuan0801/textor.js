import React, {useEffect, useRef} from "react";
import "../style/Block.css";
import {getSelectionCharacterOffsetWithin} from "../controller/Cursor/utilts";
import debounce from "lodash/debounce";
import {CursorPos} from "../controller/Cursor/interfaces";
import {ITextBlockContent, TEXT_BLOCK_ACTION, TEXT_TYPE,} from "../controller/Block/TextBlock/interfaces";
import {EditorBlock} from "../controller/Block/EditorBlock/EditorBlock";
import {EditorContainer} from "../controller/Container/EditorContainer";
import {TextBlock} from "../controller/Block/TextBlock/TextBlock";
import {ISelectedBlock} from "../controller/Container/interfaces";
import {safeJSONParse} from "../controller/Block/utils";
import {BLOCK_TYPE, IEditorBlock,} from "../controller/Block/EditorBlock/interfaces";
import {HeadingBlock, HeadingTypeCode,} from "../controller/Block/TextBlock/HeadingBlock";
import {ListBlock} from "../controller/Block/ListBlock/ListBlock";

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
    savingBlockContent();
    if (blockInfo.getType() === BLOCK_TYPE.list) {
      const caretPos = getSelectionCharacterOffsetWithin(e.target);
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
        }
        // follow native behaviour when enter create a new list element
        else {
          // record state for list block before a new list element if created
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
    if (e.code === "Enter") {
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
      if ((blockInfo as TextBlock).getPrevAction() !== TEXT_BLOCK_ACTION.origin) {
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
        if ((blockInfo as TextBlock).getPrevAction() === TEXT_BLOCK_ACTION.delete) {
          blockInfo.saveCurrentContent();
          (blockInfo as TextBlock).recordHistory();
        }
        (blockInfo as TextBlock).setPrevAction(TEXT_BLOCK_ACTION.input);
      }
      debounceSave();
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
