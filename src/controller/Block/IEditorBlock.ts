enum TEXT_TYPE {
  normal,
  link
}

enum TEXT_STYLE {
  bold,
  marked
}

// Data structure for content in each block
interface blockContent {
  textType: TEXT_TYPE;
  isMarked: boolean;
  isBold?: boolean;
  textContent?: string;
  linkHref?: string;
}



export { blockContent, TEXT_TYPE, TEXT_STYLE };
