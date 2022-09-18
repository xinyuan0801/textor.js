import React, { useEffect, useRef, useState } from "react";
import "../../style/Block.css";
import { getSelectionCharacterOffsetWithin } from "../../controller/Cursor/utilts";
import debounce from "lodash/debounce";
import { CursorPos } from "../../controller/Cursor/interfaces";
import {
  ITextBlockContent,
  TEXT_BLOCK_ACTION,
  TEXT_TYPE,
} from "../../controller/Block/TextBlock/interfaces";
import { EditorBlock } from "../../controller/Block/EditorBlock/EditorBlock";
import { EditorContainer } from "../../controller/Container/EditorContainer";
import { TextBlock } from "../../controller/Block/TextBlock/TextBlock";
import { ISelectedBlock } from "../../controller/Container/interfaces";
import { safeJSONParse } from "../../controller/Block/utils";
import { BLOCK_TYPE } from "../../controller/Block/EditorBlock/interfaces";

const Block = React.memo((props) => {
  const {
    blockInfo,
    containerInfo,
    syncState,
    renderContent,
    enterHandler,
    outerContentEditable = true,
    ...config
  }: {
    blockInfo: EditorBlock;
    containerInfo: EditorContainer;
    syncState: (HTMLElement) => void;
    renderContent: (EditorBlock) => HTMLElement;
    enterHandler: (e: KeyboardEvent) => void;
    outerContentEditable: boolean;
  } = props;

  useEffect(() => {
    blockInfo.setFocused(CursorPos.end);
  }, []);

  const collectRef = (el) => {
    if (el) {
      blockInfo.setRef(el);
    }
  };

  return (
    <div
      className="block-container"
      contentEditable={outerContentEditable}
      suppressContentEditableWarning={true}
      ref={(el) => collectRef(el)}
      {...config}
    >
      {renderContent(blockInfo)}
    </div>
  );
});

export { Block };
