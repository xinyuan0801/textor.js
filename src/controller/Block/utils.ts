function safeJSONParse(JSONString: string) {
  try {
    return JSON.parse(JSONString);
  } catch (e) {
    console.error("error");
    return false;
  }
}



export { safeJSONParse };
