import React, {useCallback} from "react";

import {EditorBlock} from "../../textor/Block/EditorBlock/EditorBlock";

import {BLOCK_TYPE} from "../../textor/interfaces/EditorBlockInterfaces"

import {CursorPosEnum} from "../../textor/interfaces/CursorInterfaces"

import {TextBlock} from "../../textor/Block/TextBlock/TextBlock";

import "../../style/container.css";
import {ListBlockComponent} from "../Blocks/ListBlock/ListBlockComponent";
import {TextBlockComponent} from "../Blocks/TextBlock/TextBlockComponent";
import {HeadingBlockComponent} from "../Blocks/HeadingBlock/HeadingBlockComponent";
import {generateUniqueId} from "../utils/UniqueId";

const Container = (props) => {
  const { containerInstance, blockArray, setBlockArray } = props;

  const syncBlockState = useCallback((newBlockArrayState) => {
    setBlockArray(newBlockArrayState.slice());
  }, []);

  const handleClickContainer = () => {
    const editorBlocks = containerInstance.current.getBlocks();
    const lastBlock = editorBlocks[editorBlocks.length - 1];
    if (!lastBlock || lastBlock.ref.innerHTML !== "") {
      const defaultBlock = new TextBlock(
        generateUniqueId(),
        BLOCK_TYPE.TEXT,
        []
      );
      containerInstance.current.insertBlock(-1, defaultBlock);
      const blocksArray = containerInstance.current.getBlocks().slice();
      // due to useRef, manually calling rendering
      setBlockArray(blocksArray);
    } else {
      lastBlock.setFocused(CursorPosEnum.END);
    }
  };

  const renderBlock = (blockInstance: EditorBlock<any>) => {
    const blockType = blockInstance.getType();
    if (blockType === BLOCK_TYPE.TEXT) {
      return (
        <TextBlockComponent
          key={blockInstance.key}
          blockKey={blockInstance.key}
          blockInfo={blockInstance}
          containerInfo={containerInstance.current}
          syncState={syncBlockState}
        ></TextBlockComponent>
      );
    } else if (blockType === BLOCK_TYPE.LIST) {
      return (
        <ListBlockComponent
          key={blockInstance.key}
          blockKey={blockInstance.key}
          blockInfo={blockInstance}
          containerInfo={containerInstance.current}
          syncState={syncBlockState}
        ></ListBlockComponent>
      );
    } else if (blockType === BLOCK_TYPE.HEADING) {
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
