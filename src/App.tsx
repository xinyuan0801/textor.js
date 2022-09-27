import "./App.css";
import { Container } from "./components/Container";
import React, { useState } from "react";
import {
  HeadingBlock,
  HeadingTypeCode,
} from "./controller/Block/TextBlock/HeadingBlock";
import {
  TEXT_STYLE_ACTION,
  TEXT_TYPE,
} from "./controller/Block/TextBlock/interfaces";
import { BLOCK_TYPE } from "./controller/Block/EditorBlock/interfaces";
import { ListBlock } from "./controller/Block/ListBlock/ListBlock";
import { useGenerateContainer } from "./components/ContainerHooks";
import { TextBlock } from "./controller/Block/TextBlock/TextBlock";
import {generateUniqueId} from "./utils/uuid";

function App() {
  const containerInstance = useGenerateContainer();

  const [blockArray, setBlockArray] = useState(
    containerInstance.current.getBlocks()
  );

  const addHeading = (headingSize: HeadingTypeCode) => {
    const headingBlock = new HeadingBlock(
      Date.now(),
      BLOCK_TYPE.heading,
      [{ textType: TEXT_TYPE.heading, textContent: "heading测试" }],
      headingSize
    );
    const newEditorContents = containerInstance.current.insertBlock(
      -1,
      headingBlock
    );
    setBlockArray(newEditorContents);
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
        targetBlock.setKey(generateUniqueId());
        setBlockArray(containerInstance.current.getBlocks());
      }
    }
  };

  const addList = () => {
    const listBlock = new ListBlock(Date.now(), BLOCK_TYPE.list, [
      [{ textContent: "", textType: TEXT_TYPE.list }],
    ]);
    const newEditorContents = containerInstance.current.insertBlock(
      -1,
      listBlock
    );
    // const blocksArray = containerInstance.current.getBlocks().slice();
    // // due to useRef, manually calling rerendering
    setBlockArray(newEditorContents);
  };

  return (
    <div className="App">
      <button onClick={addList}>增加列表元素</button>
      <button
        onClick={() => {
          addHeading(HeadingTypeCode.one);
        }}
      >
        增加heading1
      </button>
      <button
        onClick={() => {
          addHeading(HeadingTypeCode.two);
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
      <button
        onClick={() => {
          console.log(containerInstance.current.exportContents());
        }}
      >
        导出数据
      </button>
      <button
        onClick={() => {
          containerInstance.current.importContents([
            {
              key: 1663289834570,
              contents: [
                {
                  textType: "text",
                  textContent: "dasdasdasddasdasdasd",
                  isMarked: false,
                  isBold: false,
                  isUnderline: false,
                },
              ],
              type: "text",
              nativeCopy: false,
            },
            {
              key: 1663289835653,
              contents: [
                {
                  textType: "text",
                  textContent: "dasdasdasddasdasdasd",
                  isMarked: false,
                  isBold: false,
                  isUnderline: false,
                },
              ],
              type: "text",
              nativeCopy: false,
            },
            {
              key: 1663289836575,
              contents: [
                {
                  textType: "text",
                  textContent: "dasdasdasdasddasdasdasdasd",
                  isMarked: false,
                  isBold: false,
                  isUnderline: false,
                },
              ],
              type: "text",
              nativeCopy: false,
            },
            {
              key: 1663289837879,
              contents: [
                {
                  textType: "text",
                  textContent: "dasdasdasdasdasdas",
                  isMarked: false,
                  isBold: false,
                  isUnderline: false,
                },
              ],
              type: "text",
              nativeCopy: false,
            },
          ]);
          setBlockArray(containerInstance.current.getBlocks());
        }}
      >
        导入数据
      </button>
      <Container
        containerInstance={containerInstance}
        blockArray={blockArray}
        setBlockArray={setBlockArray}
      />
    </div>
  );
}

export default App;
