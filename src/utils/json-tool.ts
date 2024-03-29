function safeJSONParse(JSONString: string) {
  try {
    return JSON.parse(JSONString);
  } catch (e) {
    console.error("error");
    return false;
  }
}
/**
 * basic deep clone that return a deep copy of content, do not use when object contain function
 * @param content
 */
function basicDeepClone(content: any) {
  return safeJSONParse(JSON.stringify(content));
}

export { basicDeepClone, safeJSONParse };
