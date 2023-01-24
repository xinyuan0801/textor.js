import {useRef} from "react";
import {Textor} from "../../textor/Textor/Textor";
import {IPlugin} from "../../textor/interfaces/TextorInterface";

const useGenerateTextor = (config: IPlugin, defaultBlock: string): Textor => {
  const TextorInstance = new Textor(config, defaultBlock);
  return useRef<Textor>(TextorInstance).current;
};

export { useGenerateTextor };
