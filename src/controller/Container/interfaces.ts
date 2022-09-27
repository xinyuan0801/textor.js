import {BLOCK_TYPE} from "../Block/EditorBlock/interfaces";

interface ISelectedBlock {
  blockKey: string;
  selectionStart: number;
  selectionEnd: number;
}

interface IClipboardInfo {
  plainText: string;
  textContext: string;
}

interface IImportBlock {
  contents: any[],
  key: string,
  type: BLOCK_TYPE,
}

export { ISelectedBlock, IClipboardInfo, IImportBlock };
