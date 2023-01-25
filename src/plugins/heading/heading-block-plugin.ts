import {
  ITextBlock,
  ITextBlockContent,
  TEXT_BLOCK_ACTION,
  TEXT_STYLE_ACTION,
  TEXT_TYPE,
} from "../text/text-block-interfaces";
import { normalTextConverter } from "../text/utils/text-block-management";
import { CursorPosEnum } from "../../textor-core/interfaces/cursor";
import { setCursorPos } from "../utils/cursor-manager";

export enum HeadingTypeCode {
  one = "H1",
  two = "H2",
  three = "H3",
}
export function HeadingBlockPlugin(
  type: string,
  blockContents,
  headingTypeCode
) {
  this.type = type;
  this.blockContents = blockContents;
  this.headingType = headingTypeCode;
  this.prevAction = TEXT_BLOCK_ACTION.origin;
  this.nativeCopy = false;
}

HeadingBlockPlugin.prototype.getHeadingType = function (): HeadingTypeCode {
  return this.headingType;
};

HeadingBlockPlugin.prototype.sync = function (
  currentContent: HTMLElement
): ITextBlockContent[] {
  const newRenderBlockContent: ITextBlockContent[] = [];
  const childNodes = currentContent.childNodes;
  childNodes.forEach((child) => {
    if (
      child.nodeName === "H1" ||
      child.nodeName === "H2" ||
      child.nodeName === "H3"
    ) {
      newRenderBlockContent.push({
        textType: TEXT_TYPE.heading,
        textContent: normalTextConverter(child.textContent),
        isMarked: false,
        isBold: false,
        isUnderline: false,
        headingSize: child.nodeName as HeadingTypeCode,
      });
    }
  });
  console.log("heading synced", newRenderBlockContent);
  return newRenderBlockContent;
};

HeadingBlockPlugin.prototype.isEmpty = function (): boolean {
  // for instant check of block content, directly check dom element content
  const blockContent = this.ref.innerHTML;
  return blockContent === "<h1><br></h1>";
};

HeadingBlockPlugin.prototype.setContent = function (
  blockContents: ITextBlockContent[]
) {
  if (blockContents.length === 0) {
    this.blockContents = blockContents;
    return;
  }
  let headingContent = "";
  blockContents.forEach((content) => {
    headingContent += content.textContent;
  });
  this.blockContents = [
    { textContent: headingContent, textType: TEXT_TYPE.heading },
  ];
};

HeadingBlockPlugin.prototype.setFocused = function (
  position: CursorPosEnum
): void {
  setCursorPos(this.ref, position);
};

HeadingBlockPlugin.prototype.saveCurrentContent = function () {
  const newContents = this.sync(this.ref);
  this.setContent(newContents);
};

HeadingBlockPlugin.prototype.setPrevAction = function (
  newAction: TEXT_BLOCK_ACTION
): void {
  this.prevAction = newAction;
};

HeadingBlockPlugin.prototype.getPrevAction = function ():
  | TEXT_BLOCK_ACTION
  | TEXT_STYLE_ACTION {
  return this.prevAction;
};

HeadingBlockPlugin.prototype.getTotalContentLength = function (): number {
  let totalLength = 0;
  this.blockContents.forEach((blockContent) => {
    totalLength = totalLength + blockContent.textContent.length;
  });
  return totalLength;
};

HeadingBlockPlugin.prototype.getNativeCopy = function () {
  return this.nativeCopy;
};
