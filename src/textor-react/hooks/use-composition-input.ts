import {useRef} from "react";

export function useCompositionInput() {
  const compositionInput = useRef<boolean>(false);
  const handleCompositionStart = () => {
    compositionInput.current = true;
  };

  const handleCompositionEnd = () => {
    compositionInput.current = false;
  };

  return [compositionInput, handleCompositionStart, handleCompositionEnd]
}