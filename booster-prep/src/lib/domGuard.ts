/**
 * Browser extensions and built-in page translators sometimes move or remove nodes that React
 * rendered. React then throws on its next update ("Failed to execute 'removeChild' on 'Node'") and
 * the whole page goes blank. These guards make those two DOM calls tolerate a node that has already
 * been moved, which is the usual workaround.
 */
export function guardDomAgainstExtensions() {
  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };
  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return insertBefore.call(this, node, null) as T;
    return insertBefore.call(this, node, ref) as T;
  };
}
