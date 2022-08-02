import React, { useEffect } from "react";
import "../style/Block.css";
import { getSelectionCharacterOffsetWithin } from "../controller/Cursor/utilts";
import debounce from "lodash/debounce";
import { CursorPos } from "../controller/Cursor/ICursorManager";
import {
  HeadingTypeCode,
  ITextBlockContent,
  TEXT_BLOCK_ACTION,
  TEXT_TYPE,
} from "../controller/Block/TextBlock/ITextBlock";
import { EditorBlock } from "../controller/Block/EditorBlock/EditorBlock";
import { EditorContainer } from "../controller/Container/EditorContainer";
import { TextBlock } from "../controller/Block/TextBlock/TextBlock";
import { ISelectedBlock } from "../controller/Container/IEditorContainer";
import { safeJSONParse } from "../controller/Block/utils";
import {
  BLOCK_TYPE,
  IEditorBlock,
} from "../controller/Block/EditorBlock/IEditorBlock";
import { HeadingBlock } from "../controller/Block/TextBlock/HeadingBlock";
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

  useEffect(() => {
    blockInfo.setFocused(CursorPos.end);
  }, []);

  useEffect(() => {});

  const savingBlockContent = (e) => {
    const newContents = blockInfo.sync(e);
    blockInfo.setContent(newContents);
    console.log(
      "saving",
      blockInfo.getContents(),
      (blockInfo as TextBlock).history
    );
  };

  const debounceSave = debounce(savingBlockContent, 200);

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
      if (blockInfo.getType() === BLOCK_TYPE.list) {
        const caretPos = getSelectionCharacterOffsetWithin(e.target);
        console.log(caretPos);
        if (
          caretPos.start === caretPos.end &&
          caretPos.start === (blockInfo as ListBlock).getTotalContentLength()
        ) {
          const listElements = (blockInfo as ListBlock).getContents();
          const lastListElement = listElements[listElements.length - 1];
          console.log(lastListElement);
          if (
            lastListElement.length === 0 ||
            (lastListElement.length === 1 &&
              lastListElement[0].textContent.length === 0)
          ) {
            e.preventDefault();
            savingBlockContent(blockInfo.ref);
            (blockInfo as ListBlock).setContent(
              listElements.slice(0, listElements.length - 1)
            );
            (blockInfo as ListBlock).setKey(Date.now() * Math.random());
            const targetIndex: number = containerInfo.getBlockIndex(
              blockInfo.getKey()
            );
            containerInfo.insertBlock(targetIndex + 1);
            syncState(containerInfo.getBlocks());
          }
        }
        console.log(caretPos);
      } else {
        e.preventDefault();
        savingBlockContent(blockInfo.ref);
        const targetIndex: number = containerInfo.getBlockIndex(
          blockInfo.getKey()
        );
        containerInfo.insertBlock(targetIndex + 1);
        syncState(containerInfo.getBlocks());
      }
    } else if (e.code === "Backspace" && blockInfo.ref.innerHTML === "") {
      e.preventDefault();
      savingBlockContent(blockInfo.ref);
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
      if (
        blockInfo.getType() === BLOCK_TYPE.text ||
        blockInfo.getType() === BLOCK_TYPE.heading
      ) {
        const textBlock = blockInfo as TextBlock;
        if (textBlock.getPrevAction() === TEXT_BLOCK_ACTION.input) {
          savingBlockContent(blockInfo.getRef());
          textBlock.recordHistory();
        }
        textBlock.setPrevAction(TEXT_BLOCK_ACTION.delete);
      }
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
    } else if (e.code === "ArrowDown") {
      const caretPos = getSelectionCharacterOffsetWithin(e.target);
      const contentLength = (blockInfo as TextBlock).getTotalContentLength();
      console.log(blockInfo);
      if (caretPos.end === contentLength) {
        e.preventDefault();
        console.log("trying go down");
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
      savingBlockContent(blockInfo.ref);
      (blockInfo as TextBlock).redoHistory();
      blockInfo.setKey(Date.now());
      syncState(containerInfo.getBlocks());
    } else if (e.code === "KeyZ" && e.metaKey) {
      e.preventDefault();
      savingBlockContent(blockInfo.ref);
      (blockInfo as TextBlock).undoHistory();
      blockInfo.setKey(Date.now());
      syncState(containerInfo.getBlocks());
    }
  };

  const handleOnInput = () => {
    if (
      blockInfo.getType() === BLOCK_TYPE.text ||
      blockInfo.getType() === BLOCK_TYPE.heading
    ) {
      (blockInfo as TextBlock).setPrevAction(TEXT_BLOCK_ACTION.input);
    }
    debounceSave(blockInfo.ref);
    debounceRecordHistory();
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
      {parseBlockContent(blockInfo)}
    </div>
  );
});

export { Block };
