import { CursorPos } from "../interfaces/CursorInterfaces";

/**
 * set cursor at given position in textContent
 * @param textContent
 * @param position
 */
export function setCursorPos(
  textContent: HTMLElement | ChildNode,
  position: CursorPos
) {
  const isStart = position === CursorPos.start;
  const range = document.createRange();
  range.selectNodeContents(textContent);
  range.collapse(isStart);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}
