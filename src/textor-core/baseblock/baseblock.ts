import { BLOCK_TYPE } from "../interfaces/editor-block";

export function Baseblock(key: string) {
  this.key = key;
  this.type = null;
  this.tunnelTrain = null;
  this.blockContent = null;
  this.tunnel = new Promise((resolve) => (this.tunnelTrain = resolve));
  this.ref = null;
}

Baseblock.prototype.getKey = function (): string {
  return this.key;
};

Baseblock.prototype.setKey = function (newKey: string): void {
  this.key = newKey;
};

Baseblock.prototype.getType = function (): string {
  return this.type;
};

Baseblock.prototype.setType = function (newType: BLOCK_TYPE): void {
  this.type = newType;
};

Baseblock.prototype.getRef = function (): HTMLElement {
  return this.ref;
};

Baseblock.prototype.setRef = function (newRef: HTMLElement): void {
  this.ref = newRef;
};

Baseblock.prototype.getContents = function (): unknown[] {
  return this.blockContents;
};

Baseblock.prototype.setContent = function (newContents: unknown[]) {
  this.blockContents = newContents;
};
