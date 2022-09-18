import {BLOCK_TYPE} from "../Block/EditorBlock/interfaces";

interface ISelectedBlock {
  blockKey: number;
  selectionStart: number;
  selectionEnd: number;
}

interface IClipboardInfo {
  plainText: string;
  textContext: string;
}

interface IImportBlock {
  contents: any[],
  key: number,
  type: BLOCK_TYPE,
}

export { ISelectedBlock, IClipboardInfo, IImportBlock };
