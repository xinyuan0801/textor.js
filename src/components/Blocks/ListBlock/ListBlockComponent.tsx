import React from "react";
import { Block } from "../Block";
import { EditorBlock } from "../../../controller/Block/EditorBlock/EditorBlock";
import { EditorContainer } from "../../../controller/Container/EditorContainer";
import { ITextBlockContent } from "../../../controller/Block/TextBlock/interfaces";
import { ListBlock } from "../../../controller/Block/ListBlock/ListBlock";
import {getSelectionCharacterOffsetWithin} from "../../../controller/Cursor/utilts";

const ListBlockComponent = (props) => {
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

  const parseListElement = (content: ITextBlockContent[], index: number) => {
    return <li key={Date.now() + index}>{parseTextBlockContents(content)}</li>;
  };

  const parseListBlock = (
    listContents: ITextBlockContent[][]
  ): HTMLElement[] | undefined => {
    return <ul contentEditable={true}>{listContents.map(parseListElement)}</ul>;
  };

  const handleEnterPressed = (e: KeyboardEvent) => {
    blockInfo.saveCurrentContent();
    const caretPos = getSelectionCharacterOffsetWithin(e.target);
    console.log(caretPos);
    // press enter at end of a list element
    if (
      caretPos.start === caretPos.end &&
      caretPos.start === (blockInfo as ListBlock).getTotalContentLength()
    ) {
      const listBlock = blockInfo as ListBlock;
      const listElements = listBlock.getContents();
      const lastListElement = listElements[listElements.length - 1];
      // if last list element is empty and hit enter again, jump out of list block
      if (
        lastListElement.length === 0 ||
        (lastListElement.length === 1 &&
          lastListElement[0].textContent.length === 0)
      ) {
        console.log("special action");
        e.preventDefault();
        // avoid cases when a newly list block is made
        if (listElements.length === 1) {
          containerInfo.deleteBlock(blockInfo.getKey());
        } else {
          listBlock.setContent(
            listElements.slice(0, listElements.length - 1)
          );
          listBlock.setKey(Date.now() * Math.random());
        }
        const targetIndex: number = containerInfo.getBlockIndex(
          blockInfo.getKey()
        );
        containerInfo.insertBlock(targetIndex + 1);
        syncState(containerInfo.getBlocks());
      }
      // follow native behaviour when enter create a new list element
      else {
        // record state for list block before a new list element if created
        blockInfo.recordHistory(
          listElements.slice(0, listElements.length - 1)
        );
      }
    }
    blockInfo.recordHistory();
  }

  const renderContent = (blockInfo: EditorBlock) => {
    const listContents = (blockInfo as ListBlock).getContents();
    return parseListBlock(listContents);
  };

  return (
    <Block
      blockInfo={blockInfo}
      containerInfo={containerInfo}
      syncState={syncState}
      renderContent={renderContent}
      enterHandler={handleEnterPressed}
      outerContentEditable={false}
    ></Block>
  );
};

export { ListBlockComponent };
