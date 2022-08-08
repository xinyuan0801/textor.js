interface ISelectedBlock {
  blockKey: number;
  selectionStart: number;
  selectionEnd: number;
}

interface IClipboardInfo {
  plainText: string;
  textContext: string;
}

export { ISelectedBlock, IClipboardInfo };
