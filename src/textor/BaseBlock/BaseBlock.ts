export function BaseBlock(key: string) {
  this.key = key;
  this.type = null;
  this.blockContents = [];
  this.ref = null;
}

BaseBlock.prototype.getKey = function(): string {
  return this.key;
}

BaseBlock.prototype.setKey = function(newKey: string): void {
  this.key = newKey;
}

BaseBlock.prototype.getType = function(): string {
  return this.type;
}

BaseBlock.prototype.setType = function(newType: string): void {
  this.type = newType;
}

BaseBlock.prototype.getRef = function(): HTMLElement {
  return this.ref;
}

BaseBlock.prototype.setRef = function(newRef: HTMLElement): void {
  this.ref = newRef;
}

BaseBlock.prototype.getContents = function(): any[]{
  return this.blockContents;
}

BaseBlock.prototype.setContent = function(newContents: any[]) {
  this.blockContents = newContents;
}
