import React, { useCallback } from "react";
import { BLOCK_TYPE } from "../../textor/interfaces/EditorBlockInterfaces";
import { CursorPosEnum } from "../../textor/interfaces/CursorInterfaces";
import "../../style/container.css";
import { generateUniqueId } from "../../utils/UniqueId";
import { UsePluginInitialization } from "../hooks/UsePluginInitialization";

const Container = (props) => {
  const { textorInstance, blockArray, setBlockArray, plugins } = props;
  const containerInstance = textorInstance.container;
  const blockRenderMap = UsePluginInitialization(plugins);

  const syncBlockState = useCallback((newBlockArrayState) => {
    setBlockArray(newBlockArrayState.slice());
  }, []);

  const handleClickContainer = () => {
    const editorBlocks = containerInstance.getBlocks();
    const lastBlock = editorBlocks[editorBlocks.length - 1];
    if (!lastBlock || lastBlock.ref.innerHTML !== "") {
      const defaultBlock = textorInstance.blockFactory(
        BLOCK_TYPE.TEXT,
        [generateUniqueId()],
        [],
        [BLOCK_TYPE.TEXT, []]
      );
      console.log(defaultBlock);
      containerInstance.insertBlock(-1, defaultBlock);
      const blocksArray = containerInstance.getBlocks().slice();
      // due to useRef, manually calling rendering
      setBlockArray(blocksArray);
    } else {
      lastBlock.setFocused(CursorPosEnum.END);
    }
  };

  const renderBlock = (blockInstance: any) => {
    const blockType = blockInstance.getType();
    const BlockRenderFunction = blockRenderMap.get(blockType);
    return (
      <BlockRenderFunction
        key={blockInstance.key}
        blockKey={blockInstance.key}
        blockInfo={blockInstance}
        containerInfo={containerInstance}
        syncState={syncBlockState}
      />
    );
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
