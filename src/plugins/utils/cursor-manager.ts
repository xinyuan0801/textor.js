import { CursorPosEnum } from "../../textor-core/interfaces/cursor";

/**
 * set cursor at given position in textContent
 * @param textContent
 * @param position
 */
export function setCursorPos(
  textContent: HTMLElement | ChildNode,
  position: CursorPosEnum
) {
  const isStart = position === CursorPosEnum.START;
  const range = document.createRange();
  range.selectNodeContents(textContent);
  range.collapse(isStart);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}
