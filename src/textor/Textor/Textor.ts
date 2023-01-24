import {IPlugin} from "../interfaces/TextorInterface";
import {BaseBlock} from "../BaseBlock/BaseBlock";
import {mergeConstructor, mergePrototype} from "./utils";
import {EditorContainer} from "../Container/EditorContainer";

export class Textor {
  plugins: IPlugin
  blockMap: Map<string, Function>
  container: EditorContainer
  constructor(plugins: IPlugin, defaultBlock: string) {
    this.plugins = plugins;
    this.blockMap = new Map<string, Function>();
    this.container = new EditorContainer();
    this.initializePlugins(plugins);
    this.container.setDefaultBlock(this.blockMap.get(defaultBlock));
  }

  initializePlugins(plugins: IPlugin) {
    const globalPlugin = plugins["global"];
    const pluginKeys = Object.keys(plugins);
    for (let i = 0; i < pluginKeys.length; i++) {
      if (pluginKeys[i] !== "global") {
        const scopedPlugins = plugins[pluginKeys[i]];
        const mergedConstructor = mergeConstructor(BaseBlock, [...globalPlugin, ...scopedPlugins]);
        mergedConstructor.prototype = mergePrototype(BaseBlock, [...globalPlugin, ...scopedPlugins]);
        this.blockMap.set(pluginKeys[i], mergedConstructor);
      }
    }
  }

  getBlockMap(): Map<string, Function> {
    console.log(this.blockMap);
    return this.blockMap;
  }

  blockFactory(type, ...args) {
    const blockConstructor = this.blockMap.get(type);
    // @ts-ignore
    return new blockConstructor(...args)
  }


}
