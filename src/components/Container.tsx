import React, { useCallback, useState } from "react";

import {TextBlock} from "../controller/Block/TextBlock/TextBlock";

import "../style/container.css";
import { useGenerateContainer } from "./ContainerHooks";
import { EditorBlock } from "../controller/Block/EditorBlock/EditorBlock";
import {
  TEXT_STYLE_ACTION,
  TEXT_TYPE,
} from "../controller/Block/TextBlock/interfaces";
import { BLOCK_TYPE } from "../controller/Block/EditorBlock/interfaces";
import { CursorPos } from "../controller/Cursor/interfaces";
import {
  HeadingBlock,
  HeadingTypeCode,
} from "../controller/Block/TextBlock/HeadingBlock";
import { ListBlock } from "../controller/Block/ListBlock/ListBlock";
import { ListBlockComponent } from "./Blocks/ListBlock/ListBlockComponent";
import { TextBlockComponent } from "./Blocks/TextBlock/TextBlockComponent";
import { HeadingBlockComponent } from "./Blocks/HeadingBlock/HeadingBlockComponent";

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
    } else {
      lastBlock.setFocused(CursorPos.end);
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
      }
    }
  };

  const addHeading = (headingSize: HeadingTypeCode) => {
    const headingBlock = new HeadingBlock(
      Date.now(),
      BLOCK_TYPE.heading,
      [{ textType: TEXT_TYPE.heading, textContent: "heading测试" }],
      headingSize
    );
    containerInstance.current.insertBlock(-1, headingBlock);
  };

  const addList = () => {
    const listBlock = new ListBlock(Date.now(), BLOCK_TYPE.list, [
      [{ textContent: "", textType: TEXT_TYPE.list }],
    ]);
    containerInstance.current.insertBlock(-1, listBlock);
    const blocksArray = containerInstance.current.getBlocks().slice();
    // due to useRef, manually calling rerendering
    setBlockArray(blocksArray);
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
      <button onClick={addList}>增加列表元素</button>
      <button
        onClick={() => {
          addHeading(HeadingTypeCode.one);
          const blocksArray = containerInstance.current.getBlocks().slice();
          // due to useRef, manually calling rerendering
          setBlockArray(blocksArray);
        }}
      >
        增加heading1
      </button>
      <button
        onClick={() => {
          addHeading(HeadingTypeCode.two);
          const blocksArray = containerInstance.current.getBlocks().slice();
          // due to useRef, manually calling rerendering
          setBlockArray(blocksArray);
        }}
      >
        增加heading2
      </button>
      <button
        onClick={() => {
          addHeading(HeadingTypeCode.three);
          const blocksArray = containerInstance.current.getBlocks().slice();
          // due to useRef, manually calling rerendering
          setBlockArray(blocksArray);
        }}
      >
        增加heading3
      </button>
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
        {blockArray.map(renderBlock)}
      </div>
    </>
  );
}

export { Container };
