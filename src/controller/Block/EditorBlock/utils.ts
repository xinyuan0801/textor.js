import { ITextBlockContent } from "../TextBlock/interfaces";
import { safeJSONParse } from "../utils";

/**
 * basic deep clone that return a deep copy of content, do not use when object contain function
 * @param content
 */
function basicDeepClone(content: any) {
  return safeJSONParse(JSON.stringify(content));
}

export { basicDeepClone };
