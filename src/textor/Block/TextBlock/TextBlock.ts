import {EditorBlock} from "../EditorBlock/EditorBlock";
import {
  checkInSelection,
  checkSameContentType,
  findFirstContent,
  generateNewContent,
  mergeContent,
  normalTextConverter,
} from "../../utils/Block/TextBlockManagement";
import {setCursorPos} from "../../Cursor/CursorManager";
import {CursorPos} from "../../interfaces/CursorInterfaces";
import {
  ITextBlock,
  ITextBlockContent,
  TEXT_BLOCK_ACTION,
  TEXT_STYLE_ACTION,
  TEXT_TYPE,
} from "../../interfaces/TextBlockInterfaces";
import {LinkedList} from "../../utils/LinkedList/LinkedList";

export class TextBlock extends EditorBlock<ITextBlockContent[]> implements ITextBlock {
  prevAction: TEXT_BLOCK_ACTION;
  blockContents: ITextBlockContent[];

  constructor(key, type, blockContents) {
    super(key, type, blockContents);
    this.history = new LinkedList<ITextBlockContent[]>(blockContents);
    this.currentEra = this.history.head.next;
    this.historyPtr = 0;
    this.prevAction = TEXT_BLOCK_ACTION.origin;
    this.blockContents = blockContents;
    this.nativeCopy = false;
  }

  setFocused(position: CursorPos): void {
    setCursorPos(this.ref, position);
  }

  getContents(): ITextBlockContent[] {
    return this.blockContents;
  }

  setPrevAction(newAction: TEXT_BLOCK_ACTION): void {
    this.prevAction = newAction;
  }

  getPrevAction(): TEXT_BLOCK_ACTION | TEXT_STYLE_ACTION {
    return this.prevAction;
  }

  getTotalContentLength(): number {
    let totalLength = 0;
    this.blockContents.forEach((blockContent) => {
      totalLength = totalLength + blockContent.textContent.length;
    });
    return totalLength;
  }

  sync(currentContent: HTMLElement): ITextBlockContent[] {
    const parseContent = TextBlock.parseTextHTML(currentContent);
    return this.contentCleanUp(parseContent);
  }

  generateCopyContent(
    contentIndex: number,
    contentStart: number,
    selectionStart: number,
    selectionEnd: number
  ): ITextBlockContent {
    const blockContent = this.getContents();
    const targetContent = blockContent[contentIndex];
    const contentEnd =
      contentStart + blockContent[contentIndex].textContent.length;
    if (selectionStart <= contentStart && selectionEnd >= contentEnd) {
      console.log("case 1");
      return targetContent;
    } else if (
      contentStart <= selectionStart &&
      contentEnd <= selectionEnd &&
      contentEnd - 1 >= selectionStart
    ) {
      console.log("case 2");
      const newContentText = targetContent.textContent.slice(
        selectionStart - contentStart
      );
      return generateNewContent(targetContent, newContentText);
    } else if (
      selectionStart <= contentStart &&
      selectionEnd - 1 >= contentStart &&
      selectionEnd <= contentEnd
    ) {
      console.log("case 3");
      const newContentText = targetContent.textContent.slice(
        0,
        selectionEnd - contentStart
      );
      return generateNewContent(targetContent, newContentText);
    } else if (contentStart <= selectionStart && contentEnd >= selectionEnd) {
      console.log("case 4");
      const targetText = targetContent.textContent;
      const newContentText = targetText.slice(
        selectionStart - contentStart,
        selectionEnd - contentStart
      );
      return generateNewContent(targetContent, newContentText);
    }
  }

  copyContent(startIndex: number, endIndex: number): ITextBlockContent[] {
    const currentContent = this.getContents();
    let {
      firstContentStart: leftBound,
      firstContentIndex: currentContentIndex,
    } = findFirstContent(startIndex, currentContent);
    const selectedTexts = [];
    while (
      currentContent[currentContentIndex] &&
      checkInSelection(
        leftBound,
        leftBound + currentContent[currentContentIndex]?.textContent.length,
        startIndex,
        endIndex
      )
    ) {
      selectedTexts.push(
        this.generateCopyContent(
          currentContentIndex,
          leftBound,
          startIndex,
          endIndex
        )
      );
      leftBound += currentContent[currentContentIndex].textContent.length;
      currentContentIndex++;
    }
    return selectedTexts;
  }

  /**
   * Make text contents in text block within range from startIndex to endIndex
   * @param type
   * @param startIndex
   * @param endIndex
   */
  markSelectedText(
    type: TEXT_STYLE_ACTION,
    startIndex: number,
    endIndex: number
  ): void {
    const currentContent = this.getContents();
    console.log(currentContent.slice());
    let {
      firstContentStart: leftBound,
      firstContentIndex: currentContentIndex,
    } = findFirstContent(startIndex, currentContent);
    while (
      currentContent[currentContentIndex] &&
      checkInSelection(
        leftBound,
        leftBound + currentContent[currentContentIndex]?.textContent.length,
        startIndex,
        endIndex
      )
    ) {
      console.log("processing", currentContent[currentContentIndex]);
      const currentContentOriginLength =
        currentContent[currentContentIndex].textContent.length;
      const rightBound = leftBound + currentContentOriginLength;
      const blockContents = this.getContents();
      const newBlockContent = TextBlock.annotateBlockContent(
        currentContentIndex,
        leftBound,
        startIndex,
        endIndex,
        type,
        blockContents
      );
      this.setContent(newBlockContent);
      console.log(newBlockContent);
      if (leftBound >= startIndex && rightBound <= endIndex) {
        console.log("+1");
        currentContentIndex++;
      } else if (
        leftBound <= startIndex &&
        rightBound <= endIndex &&
        rightBound >= startIndex
      ) {
        console.log("+2");
        currentContentIndex += 2;
      } else if (leftBound <= startIndex && rightBound >= endIndex) {
        console.log("+3");
        currentContentIndex += 3;
      } else {
        console.log("+1");
        currentContentIndex++;
      }
      leftBound += currentContentOriginLength;
    }
    console.log(this.blockContents);
    this.recordHistory();
    this.setPrevAction(TEXT_BLOCK_ACTION.origin);
  }

  /**
   * Insert given contents at given index in text block content
   * @param newContents
   * @param index
   */
  insertBlockContents(newContents: ITextBlockContent[], index: number): void {
    const blockContents = this.getContents();
    if (blockContents.length === 0) {
      this.setContent(newContents);
      return;
    }
    const { firstContentIndex, firstContentStart } = findFirstContent(
      index,
      blockContents,
      true
    );
    if (firstContentIndex === -1) {
      this.setContent([...blockContents, ...newContents]);
      return;
    }
    const targetContent = blockContents[firstContentIndex];
    const targetContentText = targetContent.textContent;
    const firstHalfText = targetContentText.slice(0, index - firstContentStart);
    const firstHalfContent = generateNewContent(targetContent, firstHalfText);
    const secondHalfText = targetContentText.slice(index - firstContentStart);
    const secondHalfContent = generateNewContent(targetContent, secondHalfText);
    const newContentsArray: ITextBlockContent[] = [];
    if (firstHalfText.length > 0) {
      newContentsArray.push(firstHalfContent);
    }
    newContentsArray.push(...newContents);
    if (secondHalfText.length > 0) {
      newContentsArray.push(secondHalfContent);
    }
    blockContents.splice(firstContentIndex, 1, ...newContentsArray);
    this.setContent(blockContents);
  }

  /**
   * return true if the text block has empty content, else return false
   */
  isEmpty(): boolean {
    // for instant check of block content, directly check dom element content
    const blockContent = this.ref.innerText;
    return blockContent.length === 0;
  }

  /**
   * return block contents after merging fragment contents after annotation
   * @param blockContents
   */
  contentCleanUp(blockContents: ITextBlockContent[]): ITextBlockContent[] {
    let prevContent = blockContents[0];
    const cleanBlockContents = [blockContents[0]];
    // skip first element as it is already included
    blockContents.slice(1).forEach((content) => {
      if (checkSameContentType(prevContent, content)) {
        const newContent = mergeContent(prevContent, content);
        // replace top content as it will be merged
        cleanBlockContents.splice(cleanBlockContents.length - 1, 1, newContent);
        prevContent = newContent;
      } else {
        cleanBlockContents.push(content);
        prevContent = content;
      }
    });
    return cleanBlockContents;
  }

  /**
   * Return text contents in text block content form from dom element
   * @param currentContent
   */
  static parseTextHTML(currentContent: ChildNode): ITextBlockContent[] {
    const newRenderBlockContent: ITextBlockContent[] = [];
    const childNodes = currentContent.childNodes;
    childNodes.forEach((child) => {
      if (child.nodeName === "#text") {
        newRenderBlockContent.push({
          textType: TEXT_TYPE.normal,
          textContent: child.textContent,
          isMarked: false,
          isBold: false,
          isUnderline: false,
        });
      } else if (child.nodeName === "MARK") {
        const isBold = child.childNodes[0].nodeName === "B";
        const isFirstLevelUnderLine = child.childNodes[0].nodeName === "U";
        const isUnderline =
          child.childNodes[0]?.childNodes[0]?.nodeName === "U";
        newRenderBlockContent.push({
          textType: TEXT_TYPE.normal,
          textContent: normalTextConverter(child.textContent),
          isMarked: true,
          isBold: isBold,
          isUnderline: isFirstLevelUnderLine || isUnderline,
        });
      } else if (child.nodeName === "B") {
        const isUnderline = child.childNodes[0].nodeName === "U";
        newRenderBlockContent.push({
          textType: TEXT_TYPE.normal,
          textContent: normalTextConverter(child.textContent),
          isMarked: false,
          isBold: true,
          isUnderline: isUnderline,
        });
      } else if (child.nodeName === "U") {
        newRenderBlockContent.push({
          textType: TEXT_TYPE.normal,
          textContent: normalTextConverter(child.textContent),
          isMarked: false,
          isBold: false,
          isUnderline: true,
        });
      } else if (child.nodeName === "A") {
        newRenderBlockContent.push({
          textType: TEXT_TYPE.normal,
          textContent: normalTextConverter(child.textContent),
          // @ts-ignore
          linkHref: child.getAttribute("href"),
          isMarked: false,
          isBold: false,
          isUnderline: false,
        });
      }
    });
    return newRenderBlockContent;
  }

  /**
   * Return new text content after annotation
   * @param contentIndex
   * @param contentStart
   * @param selectionStart
   * @param selectionEnd
   * @param newType
   * @param blockContent
   */
  static annotateBlockContent(
    contentIndex: number,
    contentStart: number,
    selectionStart: number,
    selectionEnd: number,
    newType: TEXT_STYLE_ACTION,
    blockContent: ITextBlockContent[]
  ): ITextBlockContent[] {
    const targetContent = blockContent[contentIndex];
    const contentEnd =
      contentStart + blockContent[contentIndex].textContent.length;
    if (selectionStart <= contentStart && selectionEnd >= contentEnd) {
      if (newType === TEXT_STYLE_ACTION.bold) {
        targetContent.isBold = true;
      } else if (newType === TEXT_STYLE_ACTION.marked) {
        targetContent.isMarked = true;
      } else if (newType === TEXT_STYLE_ACTION.unbold) {
        targetContent.isBold = false;
      } else if (newType === TEXT_STYLE_ACTION.unmarked) {
        targetContent.isMarked = false;
      } else if (newType === TEXT_STYLE_ACTION.underline) {
        targetContent.isUnderline = true;
      } else if (newType === TEXT_STYLE_ACTION.removeUnderline) {
        targetContent.isUnderline = false;
      }
    } else if (
      contentStart <= selectionStart &&
      contentEnd <= selectionEnd &&
      contentEnd - 1 >= selectionStart
    ) {
      const newContentText = targetContent.textContent.slice(
        selectionStart - contentStart
      );
      targetContent.textContent = targetContent.textContent.slice(
        0,
        selectionStart - contentStart
      );
      const newContent = generateNewContent(
        targetContent,
        newContentText,
        newType
      );
      blockContent.splice(contentIndex + 1, 0, newContent);
    } else if (
      selectionStart <= contentStart &&
      selectionEnd - 1 >= contentStart &&
      selectionEnd <= contentEnd
    ) {
      const newContentText = targetContent.textContent.slice(
        0,
        selectionEnd - contentStart
      );
      targetContent.textContent = targetContent.textContent.slice(
        selectionEnd - contentStart
      );
      const newContent = generateNewContent(
        targetContent,
        newContentText,
        newType
      );
      blockContent.splice(contentIndex, 0, newContent);
    } else if (contentStart <= selectionStart && contentEnd >= selectionEnd) {
      const targetText = targetContent.textContent;
      const newContentText = targetText.slice(
        selectionStart - contentStart,
        selectionEnd - contentStart
      );
      const newContent = generateNewContent(
        targetContent,
        newContentText,
        newType
      );
      const thirdContent: ITextBlockContent = {
        textContent: targetText.slice(selectionEnd - contentStart),
        textType: TEXT_TYPE.normal,
        isMarked: targetContent.isMarked,
        isBold: targetContent.isBold,
        isUnderline: targetContent.isUnderline,
      };
      targetContent.textContent = targetContent.textContent.slice(
        0,
        selectionStart - contentStart
      );
      blockContent.splice(contentIndex + 1, 0, newContent, thirdContent);
    }
    return blockContent;
  }

}
