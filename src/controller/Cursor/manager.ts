import {CursorPos} from "./ICursorManager";

export function setCursorPos(textContent: HTMLElement, position: CursorPos)
{
    const isStart = position === CursorPos.start;
    console.log(textContent);
    const range = document.createRange();
    range.selectNodeContents(textContent);
    range.collapse(isStart);
    console.log(range);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}