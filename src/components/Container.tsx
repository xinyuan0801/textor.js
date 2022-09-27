import React, { useCallback } from "react";

import { TextBlock } from "../controller/Block/TextBlock/TextBlock";

import "../style/container.css";
import { EditorBlock } from "../controller/Block/EditorBlock/EditorBlock";
import { BLOCK_TYPE } from "../controller/Block/EditorBlock/interfaces";
import { CursorPos } from "../controller/Cursor/interfaces";
import { ListBlockComponent } from "./Blocks/ListBlock/ListBlockComponent";
import { TextBlockComponent } from "./Blocks/TextBlock/TextBlockComponent";
import { HeadingBlockComponent } from "./Blocks/HeadingBlock/HeadingBlockComponent";
import {generateUniqueId} from "../utils/uuid";

const Container = (props) => {
  const { containerInstance, blockArray, setBlockArray } = props;

  const syncBlockState = useCallback((newBlockArrayState) => {
    setBlockArray(newBlockArrayState.slice());
  }, []);

  const handleClickContainer = () => {
    const editorBlocks: EditorBlock[] = containerInstance.current.getBlocks();
    const lastBlock: EditorBlock = editorBlocks[editorBlocks.length - 1];
    if (!lastBlock || lastBlock.ref.innerHTML !== "") {
      const defaultBlock = new TextBlock(generateUniqueId(), BLOCK_TYPE.text, []);
      containerInstance.current.insertBlock(-1, defaultBlock);
      const blocksArray = containerInstance.current.getBlocks().slice();
      // due to useRef, manually calling rerendering
      setBlockArray(blocksArray);
    } else {
      lastBlock.setFocused(CursorPos.end);
    }
  };

  const renderBlock = (blockInstance: EditorBlock) => {
    const blockType = blockInstance.getType();
    if (blockType === BLOCK_TYPE.text) {
      return (
        <TextBlockComponent
          key={blockInstance.key}
          blockKey={blockInstance.key}
          blockInfo={blockInstance}
          containerInfo={containerInstance.current}
          syncState={syncBlockState}
        ></TextBlockComponent>
      );
    } else if (blockType === BLOCK_TYPE.list) {
      return (
        <ListBlockComponent
          key={blockInstance.key}
          blockKey={blockInstance.key}
          blockInfo={blockInstance}
          containerInfo={containerInstance.current}
          syncState={syncBlockState}
        ></ListBlockComponent>
      );
    } else if (blockType === BLOCK_TYPE.heading) {
      return (
        <HeadingBlockComponent
          key={blockInstance.key}
          blockKey={blockInstance.key}
          blockInfo={blockInstance}
          containerInfo={containerInstance.current}
          syncState={syncBlockState}
        ></HeadingBlockComponent>
      );
    }
  };

  return (
    <>
      <div className="container" onClick={handleClickContainer}>
        {blockArray.map(renderBlock)}
      </div>
    </>
  );
};

export { Container };
