import React, {useRef, useState, useCallback} from "react";

import { Block } from "./Block.jsx";
import { TextBlock } from "../controller/Block/TextBlock.ts";
import { EditorContainer } from "../controller/Container/EditorContainer.ts";

import "../style/container.css";

function Container() {
  const ContainerInstance = new EditorContainer();
  const eContainer = useRef(ContainerInstance);
  const [blockArray, setBlockArray] = useState(eContainer.current.getBlocks());

  const syncBlockState = useCallback((newBlockArrayState) => {
    setBlockArray(newBlockArrayState.slice());
  }, []);

  const handleClickContainer = (e) => {
    const editorBlocks = eContainer.current.getBlocks();
    const lastBlock = editorBlocks[editorBlocks.length - 1];
    if (!lastBlock || lastBlock.ref.innerHTML !== "") {
      const testTextBlock = new TextBlock(Date.now(), "text", []);
      eContainer.current.insertBlock(-1, testTextBlock);
      const cloneBlocksInfo = eContainer.current.getBlocks().slice();
      // due to useRef, manually calling rerendering
      setBlockArray(cloneBlocksInfo);
    }
  };

  return (
    <>
      <div className="container" onClick={handleClickContainer}>
        {blockArray.map((block) => {
          return (
            <Block
              key={block.key}
              blockKey={block.key}
              blockInfo={block}
              containerInfo={eContainer.current}
              syncState={syncBlockState}
            />
          );
        })}
      </div>
    </>
  );
}

export { Container };
