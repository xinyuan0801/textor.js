import { blockContent } from "../Block/IEditorBlock";

interface ICursorPosition {
  start: number;
  end: number;
}

export const normalTextConverter = (textContent: string): string => {
  return (
    textContent
      // @ts-ignore
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&nbsp;", " ")
      .replaceAll("&amp;", "&")
      .replaceAll("&quot;", `"`)
      .replaceAll("&apos;", "'")
  );
};

export const getSelectionRange = (blockContents: blockContent[], blockRef) => {
  const selectionObject = window.getSelection();
  const selectionLength = selectionObject.toString().length;
  const targetNode = selectionObject.anchorNode.parentNode;
  const childNodes: HTMLElement[] = Array.from(blockRef.childNodes);
  const insertIndex = childNodes.findIndex((child) => {
    return child.nodeName === "#text"
      ? child.parentNode.isSameNode(targetNode)
      : child.isSameNode(targetNode);
  });
  for (let i = 0; i < selectionObject.rangeCount; i++) {
    annotateType(selectionObject.getRangeAt(i), "mark");
  }
};

export function getSelectionCharacterOffsetWithin(element): ICursorPosition {
  let start = 0;
  let end = 0;
  const doc = element.ownerDocument || element.document;
  const win = doc.defaultView || doc.parentWindow;
  let sel;
  if (typeof win.getSelection !== "undefined") {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      const range = win.getSelection().getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      start = preCaretRange.toString().length;
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      end = preCaretRange.toString().length;
    }
  } else if ((sel = doc.selection) && sel.type !== "Control") {
    const textRange = sel.createRange();
    const preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToStart", textRange);
    start = preCaretTextRange.text.length;
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    end = preCaretTextRange.text.length;
  }
  return { start: start, end: end };
}

function annotateType(range, type) {
  const newNode = document.createElement(type);
  range.surroundContents(newNode);
}
