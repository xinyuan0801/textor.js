import React from "react";
import { Block } from "../Block";
import { EditorBlock } from "../../../controller/Block/EditorBlock/EditorBlock";
import { EditorContainer } from "../../../controller/Container/EditorContainer";
import { ITextBlockContent } from "../../../controller/Block/TextBlock/interfaces";

const TextBlockComponent = React.memo((props) => {
  const {
    blockInfo,
    containerInfo,
    syncState,
  }: {
    blockInfo: EditorBlock;
    containerInfo: EditorContainer;
    syncState: (HTMLElement) => void;
  } = props;

  const parseTextBlockContents = (
    contents: ITextBlockContent[]
  ): HTMLElement[] => {
    return contents.map((content: ITextBlockContent, index: number) => {
      // no annotation support for link text
      if (content.linkHref) {
        return (
          <a
            href={content.linkHref}
            contentEditable={false}
            key={Date.now() + index}
          >
            {content.textContent}
          </a>
        );
      }
      let baseElement = content.textContent;
      baseElement = content.isUnderline ? (
        <u key={Date.now() * Math.random() + "underline"}>{baseElement}</u>
      ) : (
        baseElement
      );
      baseElement = content.isBold ? (
        <b key={Date.now() * Math.random() + "bold"}>{baseElement}</b>
      ) : (
        baseElement
      );
      baseElement = content.isMarked ? (
        <mark key={Date.now() * Math.random() + "marked"}>{baseElement}</mark>
      ) : (
        baseElement
      );
      return baseElement;
    });
  };

  const renderContent = (blockInfo: EditorBlock) => {
    const textBlockContent = blockInfo.getContents();
    return parseTextBlockContents(textBlockContent as ITextBlockContent[]);
  };

  return (
    <Block
      blockInfo={blockInfo}
      containerInfo={containerInfo}
      syncState={syncState}
      renderContent={renderContent}
    ></Block>
  );
});

export { TextBlockComponent };
