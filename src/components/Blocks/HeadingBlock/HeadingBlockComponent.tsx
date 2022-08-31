import React from "react";
import { Block } from "../Block";
import { EditorBlock } from "../../../controller/Block/EditorBlock/EditorBlock";
import { EditorContainer } from "../../../controller/Container/EditorContainer";
import { ITextBlockContent } from "../../../controller/Block/TextBlock/interfaces";
import { ListBlock } from "../../../controller/Block/ListBlock/ListBlock";
import {
  HeadingBlock,
  HeadingTypeCode,
} from "../../../controller/Block/TextBlock/HeadingBlock";

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

  return (
    <Block
      blockInfo={blockInfo}
      containerInfo={containerInfo}
      syncState={syncState}
      renderContent={renderContent}
    ></Block>
  );
};

export { HeadingBlockComponent };
