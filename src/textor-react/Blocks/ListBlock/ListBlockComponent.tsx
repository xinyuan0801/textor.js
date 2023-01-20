import React from "react";
import { Block } from "../Block";
import { EditorContainer } from "../../../textor/Container/EditorContainer";
import { ITextBlockContent } from "../../../textor/interfaces/TextBlockInterfaces";
import { ListBlock } from "../../../textor/Block/ListBlock/ListBlock";
import {useCompositionInput} from "../../hooks/UseCompositionInput";
import {
  handleTextBlur,
  handleTextCopy,
  handleTextKeyDown,
  handleTextPaste,
  handleTextSelection
} from "../../utils/TextBlockManagement";

const ListBlockComponent = (props) => {
  const {
    blockInfo,
    containerInfo,
    syncState,
  }: {
    blockInfo: ListBlock;
    containerInfo: EditorContainer;
    syncState: (HTMLElement) => void;
  } = props;

  const [compositionInput, handleCompositionStart, handleCompositionEnd] = useCompositionInput();

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

  const parseListElement = (content: ITextBlockContent[], index: number) => {
    return <li key={Date.now() + index}>{parseTextBlockContents(content)}</li>;
  };

  const parseListBlock = (
    listContents: ITextBlockContent[][]
  ): HTMLElement[] | undefined => {
    return (
      <ul contentEditable={true} suppressContentEditableWarning={true}>
        {listContents.map(parseListElement)}
      </ul>
    );
  };

  const renderContent = (blockInfo: ListBlock) => {
    const listContents = blockInfo.getContents();
    return parseListBlock(listContents);
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
      outerContentEditable={false}
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

export { ListBlockComponent };
