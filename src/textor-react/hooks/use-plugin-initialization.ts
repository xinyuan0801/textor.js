import {useRef} from "react";

const UsePluginInitialization = (plugins): Map<string, Function> => {
  const blockRenderMap = new Map();
  for (const plugin of plugins) {
    blockRenderMap.set(plugin.scope, plugin.renderFunction);
  }
  const refBlockRenderMap = useRef(blockRenderMap);
  return refBlockRenderMap.current;
}

export {UsePluginInitialization}
