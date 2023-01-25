import {useRef} from "react";
import {Textor} from "../../textor-core/textor/textor";
import {IPlugin} from "../../textor-core/interfaces/textor";

const useGenerateTextor = (config: IPlugin, defaultBlock: string): Textor => {
  const TextorInstance = new Textor(config, defaultBlock);
  return useRef<Textor>(TextorInstance).current;
};

export { useGenerateTextor };
