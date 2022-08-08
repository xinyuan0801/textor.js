import {CursorPos} from "./interfaces";

export function setCursorPos(textContent: HTMLElement, position: CursorPos)
{
    const isStart = position === CursorPos.start;
    const range = document.createRange();
    range.selectNodeContents(textContent);
    range.collapse(isStart);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}