import React from "react";
import { Block } from "../Block";
import { EditorContainer } from "../../../textor/Container/EditorContainer";
import { ITextBlockContent } from "../../../textor/interfaces/TextBlockInterfaces";
import {
  handleTextBlur,
  handleTextCopy,
  handleTextKeyDown,
  handleTextPaste,
  handleTextSelection,
} from "../../utils/TextBlockManagement";
import { TextBlock } from "../../../textor/Block/TextBlock/TextBlock";
import { useCompositionInput } from "../../hooks/UseCompositionInput";

const TextBlockComponent = React.memo((props) => {
  const {
    blockInfo,
    containerInfo,
    syncState,
  }: {
    blockInfo: TextBlock;
    containerInfo: EditorContainer;
    syncState: (HTMLElement) => void;
  } = props;

  const [compositionInput, handleCompositionStart, handleCompositionEnd] =
    useCompositionInput();

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

  const renderContent = (blockInfo: TextBlock) => {
    const textBlockContent = blockInfo.getContents();
    return parseTextBlockContents(textBlockContent);
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
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onClick={handleClick}
      onCopy={() => handleTextCopy(blockInfo, containerInfo)}
      onBlur={() => handleTextBlur(blockInfo, compositionInput)}
      onPaste={(e) => handleTextPaste(e, blockInfo, containerInfo, syncState)}
      onMouseUp={() => handleTextSelection(blockInfo, containerInfo)}
      onKeyDown={(e) =>
        handleTextKeyDown(
          e,
          blockInfo,
          containerInfo,
          compositionInput,
          syncState
        )
      }
    ></Block>
  );
});

export { TextBlockComponent };
