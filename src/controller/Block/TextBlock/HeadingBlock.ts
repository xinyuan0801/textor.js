import { TextBlock } from "./TextBlock";
import {
  HeadingTypeCode,
  ITextBlock,
  ITextBlockContent,
  TEXT_TYPE,
} from "./ITextBlock";
import {normalTextConverter} from "./utils";

interface IHeadingBlock extends ITextBlock {
  headingType: HeadingTypeCode;
}

class HeadingBlock extends TextBlock implements IHeadingBlock {
  headingType: HeadingTypeCode;

  constructor(key, type, blockContents, HeadingTypeCode) {
    super(key, type, blockContents);
    this.headingType = HeadingTypeCode;
  }

  getHeadingType(): HeadingTypeCode {
    return this.headingType;
  }

  sync(currentContent: HTMLElement) {
    const newRenderBlockContent: ITextBlockContent[] = [];
    const childNodes = currentContent.childNodes;
    console.log(childNodes);
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
        });
      }
    });
    this.blockContents = newRenderBlockContent;
    console.log(newRenderBlockContent.slice());
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

export { HeadingBlock };
