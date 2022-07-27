enum TEXT_TYPE {
  normal,
  link,
}

enum TEXT_STYLE_ACTION {
  bold,
  marked,
  underline,
  unbold,
  unmarked,
  removeUnderline
}

// Data structure for content in each block
interface blockContent {
  textType: TEXT_TYPE;
  isMarked?: boolean;
  isBold?: boolean;
  isUnderline?: boolean;
  textContent: string;
  linkHref?: string;
}

export { blockContent, TEXT_TYPE, TEXT_STYLE_ACTION };
