import {cloneDeep} from "lodash";
function mergeConstructor(base, plugins: Function[]) {
  return function(...args) {
    base.apply(this, args[0]);
    for (let i = 1; i < args.length; i++) {
      plugins[i - 1].apply(this, args[i]);
    }
  }
}

function mergePrototype(base, plugins: Function[]) {
  let newBase = cloneDeep(base.prototype);
  for (const plugin of plugins) {
    newBase = Object.assign(newBase, plugin.prototype);
  }
  return newBase;
}

export {mergeConstructor, mergePrototype};
