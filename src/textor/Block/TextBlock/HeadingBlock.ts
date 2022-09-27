import { TextBlock } from "./TextBlock";
import {
  ITextBlock,
  ITextBlockContent,
  TEXT_TYPE,
} from "../../interfaces/TextBlockInterfaces";
import { normalTextConverter } from "../../utils/Block/TextBlockManagement";

enum HeadingTypeCode {
  one = "H1",
  two = "H2",
  three = "H3",
}

interface IHeadingBlock extends ITextBlock {
  headingType: HeadingTypeCode;
}

class HeadingBlock extends TextBlock implements IHeadingBlock {
  headingType: HeadingTypeCode;

  constructor(key, type, blockContents, HeadingTypeCode) {
    super(key, type, blockContents);
    this.headingType = HeadingTypeCode;
    this.nativeCopy = false;
  }

  getHeadingType(): HeadingTypeCode {
    return this.headingType;
  }

  sync(currentContent: HTMLElement): ITextBlockContent[] {
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
  }

  isEmpty(): boolean {
    // for instant check of block content, directly check dom element content
    const blockContent = this.ref.innerHTML;
    return blockContent === "<h1><br></h1>";
  }

  setContent(blockContents: ITextBlockContent[]) {
    if (blockContents.length === 0) {
      super.setContent(blockContents);
      return;
    }
    let headingContent = "";
    blockContents.forEach((content) => {
      headingContent += content.textContent;
    });
    const mergedContent: ITextBlockContent[] = [
      { textContent: headingContent, textType: TEXT_TYPE.heading },
    ];
    super.setContent(mergedContent);
  }
}

export { HeadingBlock, IHeadingBlock, HeadingTypeCode };
