function checkInSelection(
  contentStart: number,
  contentEnd,
  selectionStart: number,
  selectionEnd: number
) {
  console.log(contentStart, contentEnd, selectionStart, selectionEnd);
  return (
    (contentStart <= selectionStart &&
      contentEnd <= selectionEnd &&
      contentEnd >= selectionStart) ||
    (selectionStart <= contentStart && selectionEnd >= contentEnd) ||
    (selectionStart <= contentStart &&
      selectionEnd >= contentStart &&
      selectionEnd <= contentEnd) ||
    (contentStart <= selectionStart && contentEnd >= selectionEnd)
  );
}

export { checkInSelection };
