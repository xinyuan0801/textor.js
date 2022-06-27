import React, { useEffect, useState } from "react";
import "../style/Block.css";
import {
  getSelectionRange,
  getSelectionCharacterOffsetWithin,
} from "../controller/utilts";
import debounce from "lodash/debounce";

const Block = React.memo((props) => {
  const { blockInfo, containerInfo, syncState } = props;
  const { key } = blockInfo;
  const [blockContents, setBlockContents] = useState(blockInfo.getContent());

  useEffect(() => {
    blockInfo.setFocused();
  }, []);

  const savingBlockContent = (e) => {
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
      const targetIndex = containerInfo.getBlockIndex(key);
      containerInfo.insertBlock(targetIndex + 1);
      syncState(containerInfo.getBlocks());
    } else if (e.code === "Backspace" && blockInfo.ref.innerHTML === "") {
      const selfIndex = containerInfo.getBlockIndex(key);
      const nextFocusedBlockIndex =
        selfIndex === 0 ? selfIndex + 1 : selfIndex - 1;
      if (containerInfo.getBlocks().length !== 1) {
        containerInfo.setFocusByIndex(nextFocusedBlockIndex);
      }
      containerInfo.deleteBlock(key);
      syncState(containerInfo.getBlocks());
    } else if (e.code === "ArrowDown") {
      const caretPos = getSelectionCharacterOffsetWithin(e.target);
      const contentLength = blockInfo.getTotalSum();
      if (caretPos.end === contentLength) {
        const selfIndex = containerInfo.getBlockIndex(key);
        const nextFocusedBlockIndex =
          selfIndex === containerInfo.getBlocks().length - 1
            ? selfIndex
            : selfIndex + 1;
        containerInfo.setFocusByIndex(nextFocusedBlockIndex);
      }
    } else if (e.code === "ArrowUp") {
      const caretPos = getSelectionCharacterOffsetWithin(e.target);
      if (caretPos.start === 0) {
        const selfIndex = containerInfo.getBlockIndex(key);
        const nextFocusedBlockIndex =
          selfIndex === 0 ? selfIndex : selfIndex - 1;
        containerInfo.setFocusByIndex(nextFocusedBlockIndex, "end");
      }
    } else {
      debounceSave(blockInfo.ref);
    }
  };

  const handleTextSelection = (e) => {
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
      {blockContents.map((content, index) => {
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
      })}
    </div>
  );
});

export { Block };
