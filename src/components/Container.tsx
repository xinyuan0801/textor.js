import React, {useCallback, useState} from "react";

import {Block} from "./Block";
import {TextBlock} from "../controller/Block/TextBlock/TextBlock";

import "../style/container.css";
import {useGenerateContainer} from "./ContainerHooks";
import {EditorBlock} from "../controller/Block/EditorBlock/EditorBlock";
import {TEXT_STYLE_ACTION, TEXT_TYPE} from "../controller/Block/TextBlock/ITextBlock";
import {BLOCK_TYPE} from "../controller/Block/EditorBlock/IEditorBlock";

function Container() {
  const containerInstance = useGenerateContainer();
  const [blockArray, setBlockArray] = useState(
    containerInstance.current.getBlocks()
  );

  const syncBlockState = useCallback((newBlockArrayState) => {
    setBlockArray(newBlockArrayState.slice());
  }, []);

  const handleClickContainer = () => {
    const editorBlocks: EditorBlock[] = containerInstance.current.getBlocks();
    const lastBlock: EditorBlock = editorBlocks[editorBlocks.length - 1];
    if (!lastBlock || lastBlock.ref.innerHTML !== "") {
      const testTextBlock = new TextBlock(Date.now(), BLOCK_TYPE.text, []);
      containerInstance.current.insertBlock(-1, testTextBlock);
      const blocksArray = containerInstance.current.getBlocks().slice();
      // due to useRef, manually calling rerendering
      setBlockArray(blocksArray);
    }
  };

  const handleSelection = (type: TEXT_STYLE_ACTION) => {
    const selectedInfo = containerInstance.current.getCurrentSelectedBlock();
    if (selectedInfo) {
      const targetBlock = containerInstance.current.getBlockByKey(
        selectedInfo.blockKey
      );
      if (targetBlock !== 0) {
        (targetBlock as TextBlock).markSelectedText(
          type,
          selectedInfo.selectionStart,
          selectedInfo.selectionEnd
        );
        targetBlock.setKey(Date.now());
        syncBlockState(containerInstance.current.getBlocks());
        console.log(containerInstance.current.getBlocks().slice());
      }
    }
  };

  return (
    <>
      <button
        onClick={() => {
          handleSelection(TEXT_STYLE_ACTION.marked);
        }}
      >
        标记
      </button>
      <button
        onClick={() => {
          handleSelection(TEXT_STYLE_ACTION.bold);
        }}
      >
        粗体
      </button>
      <button
        onClick={() => {
          handleSelection(TEXT_STYLE_ACTION.underline);
        }}
      >
        下划线
      </button>
      <button
        onClick={() => {
          handleSelection(TEXT_STYLE_ACTION.unmarked);
        }}
      >
        取消标记
      </button>
      <button
        onClick={() => {
          handleSelection(TEXT_STYLE_ACTION.unbold);
        }}
      >
        取消粗体
      </button>
      <button
        onClick={() => {
          handleSelection(TEXT_STYLE_ACTION.removeUnderline);
        }}
      >
        删除下划线
      </button>
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
