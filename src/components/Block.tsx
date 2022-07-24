import React, {useEffect, useState} from "react";
import "../style/Block.css";
import {getSelectionCharacterOffsetWithin, getSelectionRange,} from "../controller/Cursor/utilts";
import debounce from "lodash/debounce";
import {CursorPos} from "../controller/Cursor/ICursorManager";
import {blockContent} from "../controller/Block/IEditorBlock";
import {EditorBlock} from "../controller/Block/EditorBlock";
import {EditorContainer} from "../controller/Container/EditorContainer";

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
  ] = useState<blockContent[]>(blockInfo.getContent());

  useEffect(() => {
    blockInfo.setFocused(CursorPos.end);
    blockInfo.setContentSetter(setBlockContents);
  }, []);

  useEffect(() => {
    console.log("rerendering", blockContents);
  });

  const savingBlockContent = (e) => {
    console.log("content saved");
    blockInfo.sync(e);
  };

  const debounceSave = debounce(savingBlockContent, 1);

  const collectRef = (el) => {
    if (el) {
      blockInfo.setRef(el);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e) => {
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
        console.log("setting focus");
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
          const curBlockContent = blockInfo.getContent();
          prevBlock.setContent([...prevBlock.getContent(), ...curBlockContent]);
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
    } else {
      debounceSave(blockInfo.ref);
    }
  };

  const parseBlockContent = (
    content: blockContent,
    index: number
  ): HTMLElement | string => {
    if (content.textType === "normal") {
      return content.textContent;
    } else if (content.textType === "mark") {
      return <mark key={Date.now() + index}>{content.textContent}</mark>;
    } else if (content.textType === "bold") {
      return <b key={Date.now() + index}>{content.textContent}</b>;
    } else if (content.textType === "link") {
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
    getSelectionRange(blockInfo.getContent(), blockInfo.getRef());
  };

  return (
    <div
      className="block-container"
      contentEditable={true}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseUp={handleTextSelection}
      suppressContentEditableWarning={true}
      ref={(el) => collectRef(el)}
    >
      {blockContents.map(parseBlockContent)}
    </div>
  );
});

export { Block };
