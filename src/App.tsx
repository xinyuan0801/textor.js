import "./App.css";
import {Container} from "./textor-react/Container/Container";
import React, {useCallback, useState} from "react";
import {TEXT_STYLE_ACTION, TEXT_TYPE,} from "./plugins/textor-text/TextBlockInterfaces";
import {BLOCK_TYPE} from "./textor/interfaces/EditorBlockInterfaces";
import {useGenerateTextor} from "./textor-react/hooks/UseGenerateTextor";
import {generateUniqueId} from "./utils/UniqueId";
import {Textor} from "./textor/Textor/Textor";
import {TextBlockPlugin} from "./plugins/textor-text/TextBlockPlugin";
import {HistoryPlugin} from "./plugins/textor-history/HistoryPlugin";
import {TextBlockComponent} from "./plugins/textor-text/TextBlockComponent";
import {ListBlockComponent} from "./plugins/textor-list/ListBlockComponent";
import {HeadingBlockComponent} from "./plugins/textor-heading/HeadingBlockComponent";
import {ListBlockPlugin} from "./plugins/textor-list/ListBlockPlugin";
import {HeadingBlockPlugin, HeadingTypeCode} from "./plugins/textor-heading/HeadingBlockPlugin";

function App() {
  const textorInstance = useGenerateTextor({
    global: [HistoryPlugin],
    [BLOCK_TYPE.TEXT]: [TextBlockPlugin],
    [BLOCK_TYPE.LIST]: [ListBlockPlugin],
    [BLOCK_TYPE.HEADING]: [HeadingBlockPlugin],
  }, BLOCK_TYPE.TEXT);
  const containerInstance = textorInstance.container;

  const [blockArray, setBlockArray] = useState(containerInstance.getBlocks());

  const memoSetBlockArray = useCallback((newBlockArrayState) => {
    setBlockArray(newBlockArrayState.slice());
  }, []);

  const addHeading = (headingSize: HeadingTypeCode) => {
    const headingBlock = textorInstance.blockFactory(
      BLOCK_TYPE.HEADING,
      [generateUniqueId()],
      [],
      [
        BLOCK_TYPE.HEADING,
        [{ textType: TEXT_TYPE.heading, textContent: "heading测试" }],
        headingSize,
      ]
    );
    const newEditorContents = containerInstance.insertBlock(-1, headingBlock);
    memoSetBlockArray(newEditorContents);
  };

  const handleSelection = (type: TEXT_STYLE_ACTION) => {
    const selectedInfo = containerInstance.getCurrentSelectedBlock();
    console.log("selected", selectedInfo);
    if (selectedInfo) {
      const targetBlock = containerInstance.getBlockByKey(
        selectedInfo.blockKey
      );
      if (targetBlock !== 0) {
        console.log("founded");
        targetBlock.markSelectedText(
          type,
          selectedInfo.selectionStart,
          selectedInfo.selectionEnd
        );
        targetBlock.setKey(generateUniqueId());
        console.log("after setting key", containerInstance.getBlocks().slice());
        memoSetBlockArray(containerInstance.getBlocks());
      }
    }
  };

  const addList = () => {
    const listBlock = textorInstance.blockFactory(
      BLOCK_TYPE.LIST,
      [generateUniqueId()],
      [],
      [BLOCK_TYPE.LIST, [[{ textContent: "", textType: TEXT_TYPE.list }]]]
    );
    const newEditorContents = containerInstance.insertBlock(-1, listBlock);
    // const blocksArray = containerInstance.current.getBlocks().slice();
    // // due to useRef, manually calling rerendering
    memoSetBlockArray(newEditorContents);
  };

  const testrun = () => {
    const t1 = new Textor({
      global: [HistoryPlugin],
      [BLOCK_TYPE.TEXT]: [TextBlockPlugin],
    }, BLOCK_TYPE.TEXT);
    const blockFactory = t1.getBlockMap();
    const textBlockFunction = blockFactory.get(BLOCK_TYPE.TEXT);
    // @ts-ignore
    const text1 = new textBlockFunction(
      [generateUniqueId()],
      [],
      [BLOCK_TYPE.TEXT, []]
    );
    console.log(text1);
    console.log(text1.getKey());
  };

  return (
    <div className="App">
      <button onClick={testrun}>TEST RUN</button>
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
          const blocksArray = containerInstance.getBlocks().slice();
          // due to useRef, manually calling rerendering
          memoSetBlockArray(blocksArray);
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
          console.log(containerInstance.exportContents());
        }}
      >
        导出数据
      </button>
      <button
        onClick={() => {
          containerInstance.importContents([
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
          memoSetBlockArray(containerInstance.getBlocks());
        }}
      >
        导入数据
      </button>
      <Container
        textorInstance={textorInstance}
        blockArray={blockArray}
        setBlockArray={memoSetBlockArray}
        plugins={[
          { scope: BLOCK_TYPE.TEXT, renderFunction: TextBlockComponent },
          { scope: BLOCK_TYPE.LIST, renderFunction: ListBlockComponent },
          { scope: BLOCK_TYPE.HEADING, renderFunction: HeadingBlockComponent },
        ]}
      />
    </div>
  );
}

export default App;
