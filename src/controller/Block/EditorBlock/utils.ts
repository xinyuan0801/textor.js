import { ITextBlockContent } from "../TextBlock/interfaces";
import { safeJSONParse } from "../utils";

/**
 * return a deep clone of blockContents
 * @param blockContents
 */
function blockContentDeepClone(blockContents: (ITextBlockContent | ITextBlockContent[])[]) {
  return safeJSONParse(JSON.stringify(blockContents));
}

export { blockContentDeepClone };
