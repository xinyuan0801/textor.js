import React, { useEffect } from "react";
import "../../style/Block.css";
import { CursorPos } from "../../textor/interfaces/CursorInterfaces";
import { EditorBlock } from "../../textor/Block/EditorBlock/EditorBlock";
import { EditorContainer } from "../../textor/Container/EditorContainer";

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
