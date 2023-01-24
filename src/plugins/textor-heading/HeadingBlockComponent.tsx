import React from "react";
import { Block } from "../../textor-react/Blocks/Block";
import { EditorContainer } from "../../textor/Container/EditorContainer";
import { ITextBlockContent } from "../textor-text/TextBlockInterfaces";
import {
  handleTextKeyDown,
} from "../textor-text/utils/TextBlockManagement";
import {handleTextCopy, handleTextBlur, handleTextPaste, handleTextSelection} from "../utils/textContentManagement";
import {useCompositionInput} from "../../textor-react/hooks/UseCompositionInput";
import {HeadingTypeCode} from "./HeadingBlockPlugin";

const HeadingBlockComponent = (props) => {
  const {
    blockInfo,
    containerInfo,
    syncState,
  }: {
    blockInfo: any;
    containerInfo: EditorContainer;
    syncState: (HTMLElement) => void;
  } = props;

  const [compositionInput, handleCompositionStart, handleCompositionEnd] = useCompositionInput();

  const parseHeadingBlockContents = (
    contents: ITextBlockContent[]
  ): HTMLElement[] | undefined => {
    const headingBlockInfo = blockInfo;
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

  const renderContent = (blockInfo: any) => {
    const headingBlockContent = blockInfo.getContents();
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
      onSelect={() => handleTextSelection(blockInfo, containerInfo)}
      onKeyDown={(e) => handleTextKeyDown(e, blockInfo, containerInfo,compositionInput, syncState)}
    ></Block>
  );
};

export { HeadingBlockComponent };
