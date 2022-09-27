import {useRef} from "react";
import { EditorContainer } from "../../textor/Container/EditorContainer";

interface IContainerInstance {
  current: EditorContainer;
}

const useGenerateContainer = (): IContainerInstance => {
  const ContainerInstance = new EditorContainer();
  return useRef<EditorContainer>(ContainerInstance);
};

export { useGenerateContainer, IContainerInstance };
