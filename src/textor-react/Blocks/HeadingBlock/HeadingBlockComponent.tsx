import React from "react";
import { Block } from "../Block";
import { EditorBlock } from "../../../textor/Block/EditorBlock/EditorBlock";
import { EditorContainer } from "../../../textor/Container/EditorContainer";
import { ITextBlockContent } from "../../../textor/interfaces/TextBlockInterfaces";
import {
  HeadingBlock,
  HeadingTypeCode,
} from "../../../textor/Block/TextBlock/HeadingBlock";
import {
  handleTextBlur,
  handleTextCopy,
  handleTextKeyDown,
  handleTextPaste,
  handleTextSelection
} from "../../utils/TextBlockManagement";
import {useCompositionInput} from "../../hooks/UseCompositionInput";

const HeadingBlockComponent = (props) => {
  const {
    blockInfo,
    containerInfo,
    syncState,
  }: {
    blockInfo: EditorBlock;
    containerInfo: EditorContainer;
    syncState: (HTMLElement) => void;
  } = props;

  const [compositionInput, handleCompositionStart, handleCompositionEnd] = useCompositionInput();

  const parseHeadingBlockContents = (
    contents: ITextBlockContent[]
  ): HTMLElement[] | undefined => {
    const headingBlockInfo = blockInfo as HeadingBlock;
    const headingContent = contents[0];
    const baseElement = headingContent.textContent;
    const headingSize = headingBlockInfo.getHeadingType();
    if (headingSize === HeadingTypeCode.one) {
      return (
        <h1 key={Date.now() * Math.random() + "heading1"}>{baseElement}</h1>
      );
    } else if (headingSize === HeadingTypeCode.two) {
      return (
        <h2 key={Date.now() * Math.random() + "heading1"}>{baseElement}</h2>
      );
    } else if (headingSize === HeadingTypeCode.three) {
      return (
        <h3 key={Date.now() * Math.random() + "heading1"}>{baseElement}</h3>
      );
    }
  };

  const renderContent = (blockInfo: EditorBlock) => {
    const headingBlockContent = (blockInfo as HeadingBlock).getContents();
    return parseHeadingBlockContents(headingBlockContent);
  };

  const handleClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Block
      blockInfo={blockInfo}
      containerInfo={containerInfo}
      syncState={syncState}
      renderContent={renderContent}
      onClick={handleClick}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onCopy={() => handleTextCopy(blockInfo, containerInfo)}
      onBlur={() => handleTextBlur(blockInfo, compositionInput)}
      onPaste={(e) => handleTextPaste(e, blockInfo, containerInfo, syncState)}
      onMouseUp={() => handleTextSelection(blockInfo, containerInfo)}
      onKeyDown={(e) => handleTextKeyDown(e, blockInfo, containerInfo,compositionInput, syncState)}
    ></Block>
  );
};

export { HeadingBlockComponent };
