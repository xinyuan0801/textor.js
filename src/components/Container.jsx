import React, {useRef, useState, useCallback} from "react";

import { Block } from "./Block.jsx";
import { TextBlock } from "../controller/TextBlock.ts";
import { EditorContainer } from "../controller/EditorContainer.ts";

import "../style/Container.css";

function Container() {
  const ContainerInstance = new EditorContainer();
  const eContainer = useRef(ContainerInstance);
  const [blockArray, setBlockArray] = useState(eContainer.current.getBlocks());

  const syncBlockState = useCallback((newBlockArrayState) => {
    setBlockArray(newBlockArrayState.slice());
  }, []);

  const handleClick = () => {
    const cloneBlocksInfo = eContainer.current.getBlocks();
    cloneBlocksInfo[0].blockContents[1].textType = 'mark';
    console.log(cloneBlocksInfo);
  };

  const handleClickContainer = (e) => {
    const testTextBlock = new TextBlock(Date.now(), "text", [
      { textType: "mark", textContent: "mark文字测试" },
      { textType: "normal", textContent: "普通文字测试" },
    ]);
    eContainer.current.insertBlock(-1, testTextBlock);
    const cloneBlocksInfo = eContainer.current.getBlocks().slice();
    // due to useRef, manually calling rerendering
    setBlockArray(cloneBlocksInfo);
  };

  return (
    <>
      <button onClick={handleClick}>测试mark</button>
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
