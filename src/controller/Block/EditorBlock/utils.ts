import { ITextBlockContent } from "../TextBlock/interfaces";
import { safeJSONParse } from "../utils";

function blockContentDeepClone(blockContents: (ITextBlockContent | ITextBlockContent[])[]) {
  console.log("deep clone");
  return safeJSONParse(JSON.stringify(blockContents));
}

export { blockContentDeepClone };
