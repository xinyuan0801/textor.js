import React, { useCallback, useState } from "react";

import { Block } from "./Block";
import { TextBlock } from "../controller/Block/TextBlock";

import "../style/container.css";
import { useGenerateContainer } from "./ContainerHooks";
import { EditorBlock } from "../controller/Block/EditorBlock";
import { TEXT_TYPE } from "../controller/Block/IEditorBlock";

function Container() {
  const containerInstance = useGenerateContainer();
  const [blockArray, setBlockArray] = useState(
    containerInstance.current.getBlocks()
  );

  const syncBlockState = useCallback((newBlockArrayState) => {
    setBlockArray(newBlockArrayState.slice());
    console.log("container update", newBlockArrayState.slice());
  }, []);

  const handleClickContainer = () => {
    const editorBlocks: EditorBlock[] = containerInstance.current.getBlocks();
    const lastBlock: EditorBlock = editorBlocks[editorBlocks.length - 1];
    if (!lastBlock || lastBlock.ref.innerHTML !== "") {
      const testTextBlock = new TextBlock(Date.now(), "text", [
        {
          textType: TEXT_TYPE.normal,
          textContent: "mark文字测试",
          isBold: true,
          isMarked: false,
        },
      ]);
      containerInstance.current.insertBlock(-1, testTextBlock);
      const blocksArray = containerInstance.current.getBlocks().slice();
      // due to useRef, manually calling rerendering
      setBlockArray(blocksArray);
    }
  };

  return (
    <>
      <button onClick={() => {}}>active render</button>
      <div className="container" onClick={handleClickContainer}>
        {blockArray.map((block) => {
          return (
            <Block
              key={block.key}
              blockKey={block.key}
              blockInfo={block}
              containerInfo={containerInstance.current}
              syncState={syncBlockState}
            />
          );
        })}
      </div>
    </>
  );
}

export { Container };
