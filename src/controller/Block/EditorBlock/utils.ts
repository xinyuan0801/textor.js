import { ITextBlockContent } from "../TextBlock/interfaces";
import { safeJSONParse } from "../utils";

function blockContentDeepClone(blockContents: (ITextBlockContent | ITextBlockContent[])[]) {
  return safeJSONParse(JSON.stringify(blockContents));
}

export { blockContentDeepClone };
