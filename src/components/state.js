export const blockArrayState = { array: [] };
export const blockRefsState = { refs: {} };

export const insertBlock = (index, blockArray) => {
  const uId = Date.now();
  if (index === -1 || index === blockArray.length) {
    return [...blockArray, uId];
  } else {
    return [...blockArray.slice(0, index), uId, ...blockArray.slice(index)];
  }
};

export function blockArrayReducer(state, action) {
  switch (action.type) {
    case "newBlock":
      return { array: insertBlock(-1, state.array) };
    case "createNeighborBlock":
      const targetIndex = state.array.findIndex(
        (blockKey) => blockKey === action.targetKey
      );
      return { array: insertBlock(targetIndex + 1, state.array) };
    case "removeBlock":
      const newBlockArray = state.array.filter((uid) => {
        return uid !== action.targetKey;
      });
      return { array: newBlockArray };
  }
}

export function refsReducer(state, action) {
  switch (action.type) {
    case "collectRef":
      return { refs: { ...state.refs, [action.id]: [action.ref] } };
  }
};
