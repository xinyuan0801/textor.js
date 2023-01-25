import React from "react";
import { Block } from "../../textor-react/block/block";
import { EditorContainer } from "../../textor-core/container/editor-container";
import { ITextBlockContent } from "./text-block-interfaces";
import {
  handleTextKeyDown,
} from "./utils/text-block-management";
import { useCompositionInput } from "../../textor-react/hooks/use-composition-input";
import {handleTextCopy, handleTextBlur, handleTextPaste, handleTextSelection} from "../utils/text-content-management";

const TextBlockComponent = React.memo((props) => {
  const {
    blockInfo,
    containerInfo,
    syncState,
  }: {
    blockInfo: any;
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
            ref={(el) => {
              content.node = el;
            }}
          >
            {content.textContent}
          </a>
        );
      }
      let baseElement = content.textContent;
      baseElement = content.isUnderline ? (
        <u
          key={Date.now() * Math.random() + "underline"}
          ref={(el) => {
            content.node = el;
          }}
        >
          {baseElement}
        </u>
      ) : (
        baseElement
      );
      baseElement = content.isBold ? (
        <b
          key={Date.now() * Math.random() + "bold"}
          ref={(el) => {
            content.node = el;
          }}
        >
          {baseElement}
        </b>
      ) : (
        baseElement
      );
      baseElement = content.isMarked ? (
        <mark
          key={Date.now() * Math.random() + "marked"}
          ref={(el) => {
            console.log(el);
            content.node = el;
          }}
        >
          {baseElement}
        </mark>
      ) : (
        baseElement
      );
      return baseElement;
    });
  };

  const renderContent = (blockInfo: any) => {
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
      onSelect={() => handleTextSelection(blockInfo, containerInfo)}
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
