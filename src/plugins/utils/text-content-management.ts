import {getSelectionCharacterOffsetWithin} from "../../textor-core/utils/cursor-management";
import {ITextBlockContent, TEXT_BLOCK_ACTION, TEXT_TYPE} from "../text/text-block-interfaces";
import {safeJSONParse} from "../../utils/json-tool";
import {generateUniqueId} from "../../utils/unique-id";
import {ISelectedBlock} from "../../textor-core/interfaces/editor-container";

function handleTextCopy(blockInfo, containerInfo) {
  const nativeCopy = blockInfo.getNativeCopy();
  if (!nativeCopy) {
    const plainText = window.getSelection().toString();
    const caretPos = getSelectionCharacterOffsetWithin(blockInfo.getRef());
    const copiedContent = blockInfo.copyContent(caretPos.start, caretPos.end);
    const copyTextInfo = { textContent: copiedContent };
    const copyTextInfoJsonString = JSON.stringify(copyTextInfo);
    containerInfo.setClipboardInfo({
      plainText,
      textContext: copyTextInfoJsonString,
    });
  }
}

function handleTextBlur(blockInfo, compositionInput) {
  if (!compositionInput.current) {
    blockInfo.saveCurrentContent();
  }
  if (blockInfo.getPrevAction() !== TEXT_BLOCK_ACTION.origin) {
    blockInfo.recordHistory();
    console.log("recording");
    blockInfo.setPrevAction(TEXT_BLOCK_ACTION.origin);
  }
}

function handleTextPaste(e, blockInfo, containerInfo, syncState) {
  e.preventDefault();
  const nativeClipboardPlainText = e.clipboardData.getData("Text");
  const containerClipboard = containerInfo.getClipboardInfo();
  const containerClipboardPlainText = containerClipboard.plainText;
  const caretPos = getSelectionCharacterOffsetWithin(blockInfo.getRef());
  const pasteContent: { textContent: ITextBlockContent[] } = safeJSONParse(
    containerClipboard.textContext
  );
  if (containerClipboardPlainText === nativeClipboardPlainText) {
    blockInfo.insertBlockContents(
      pasteContent.textContent,
      caretPos.start
    );
    blockInfo.setKey(generateUniqueId());
    syncState(containerInfo.getBlocks());
  } else {
    const newPlainContent: ITextBlockContent[] = [
      { textContent: nativeClipboardPlainText, textType: TEXT_TYPE.normal },
    ];
    blockInfo.insertBlockContents(
      newPlainContent,
      caretPos.start
    );
    blockInfo.setKey(generateUniqueId());
    syncState(containerInfo.getBlocks());
  }
}

const handleTextSelection = (blockInfo, containerInfo) => {
  const caretPos = getSelectionCharacterOffsetWithin(blockInfo.getRef());
  if (caretPos.start !== caretPos.end) {
    const selectedBlockInfo: ISelectedBlock = {
      blockKey: blockInfo.getKey(),
      selectionStart: caretPos.start,
      selectionEnd: caretPos.end,
    };
    containerInfo.setCurrentSelectedBlock(selectedBlockInfo);
  }
};

export {handleTextCopy, handleTextBlur, handleTextPaste, handleTextSelection};
