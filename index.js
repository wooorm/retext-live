'use strict';

var nlcstToTextOM,
    deepDiff;

nlcstToTextOM = require('nlcst-to-textom');
deepDiff = require('deep-diff');

/**
 * Diff.
 */

var diff;

diff = deepDiff.diff;

/**
 * Get a tokenizer for a given node.
 *
 * @param {Object} parser
 * @param {Node} node
 * @return {Function?}
 */

function getTokenizer(parser, node) {
    var type;

    type = node.type.substr(0, node.type.indexOf('Node'));

    if ('tokenize' + type in parser) {
        return parser['tokenize' + type];
    }

    return null;
}

function resolve(node, path) {
    var part;

    path = path.concat();
    part = path.shift();

    if (path.length === 0) {
        return node;
    }

    if (part === 'children' || part === 'value') {
        return resolve(node, path);
    }

    return resolve(node[part], path.slice(1));
}

function applyArrayAddition(tree, change) {
    var addition,
        node;

    addition = nlcstToTextOM(tree.TextOM, change.item.rhs);

    node = resolve(tree, change.path);

    if (change.index === 0) {
        node.prepend(addition);
    } else {
        node[change.index - 1].after(addition);
    }
}

function applyEdit(tree, change) {
    var node,
        part,
        addition;

    part = change.path[change.path.length - 1];

    node = resolve(tree, change.path);

    if (part === 'value') {
        node.fromString(change.rhs);
    /**
     * Should always be `type`.
     */
    } else {
        addition = node.valueOf();

        addition.type = change.rhs;

        node.replace(nlcstToTextOM(node.TextOM, addition));
    }
}

function applyNLCST(node, nlcst) {
    var tree,
        item,
        changes,
        deletions,
        index,
        length,
        change;

    changes = diff(node.valueOf(), nlcst);

    if (!changes) {
        return;
    }

    /**
     * All deletions are gathered, and deleted later.
     * Otherwise, the insices shift for the other
     * changes.
     */

    deletions = [];

    try {
        index = -1;
        length = changes.length;

        while (++index < length) {
            change = changes[index];

            if (change.path.indexOf('data') !== -1) {
                continue;
            }

            if (change.kind === 'A') {
                if (change.item.kind === 'D') {
                    deletions.push(resolve(node, change.path)[change.index]);
                } else {
                    applyArrayAddition(node, change);
                }
            /* istanbul ignore else */
            } else if (change.kind === 'E') {
                applyEdit(node, change);
            } else {
                /**
                 * Should not occur. Here for debugging.
                 */

                /* istanbul ignore next */
                console.log('unknown: ', JSON.stringify(change, 0, 2));
            }
        }

        /**
         * Remove all deletions.
         */

        index = -1;
        length = deletions.length;

        while (++index < length) {
            deletions[index].remove();
        }
    /**
     * An exception occurred, but the tree is probably valid.
     * Just force the new content.
     */
    } catch (exception) {
        /**
         * Remove all children of `node`.
         */

        while (item = node.head) {
            item.remove();
        }

        tree = nlcstToTextOM(node.TextOM, nlcst);

        /**
         * Add all children of the new tree.
         */

        while (item = tree.head) {
            node.append(item);
        }

        console.log(
            'There seems to be a (serious?) problem in ' +
            '`retext-live`. The tree could not be ' +
            'modified, but completely new nodes were ' +
            'inserted. Here is the error: ',
            exception
        );
    }
}

/**
 * Update a node
 *
 * @param {string} value
 * @this {Node}
 */

function update(value) {
    var self,
        isNLCST,
        nlcst,
        parser,
        tokenizer;

    self = this;

    if (!('TextOM' in self)) {
        throw new Error(
            '`Node#update(value)` invoked on a ' +
            'non-node'
        );
    }

    isNLCST = value && value.type;

    if (isNLCST && value.type !== self.type) {
        throw new Error(
            'Incorrect NLCST applied to node of type ' +
            '`' + self.type + '`'
        );
    }

    /**
     * `self` is a text node. Exit early.
     */

    if ('fromString' in self) {
        if (isNLCST) {
            self.fromString(value.value);
        } else {
            self.fromString(value);
        }

        return;
    }

    if (!('length' in self)) {
        throw new Error(
            '`Node#update(value)` invoked on non-parent'
        );
    }

    if (!isNLCST) {
        parser = self.TextOM.parser;

        tokenizer = getTokenizer(parser, self);

        if (!tokenizer) {
            throw new Error(
                '`' + self + '` is not a valid context ' +
                'object for `Node#update(value)`'
            );
        }

        nlcst = tokenizer.call(parser, value);
    }

    applyNLCST(self, nlcst || value);
}

/**
 * Define `live`.
 */

function live() {}

/**
 * Define `attach`.
 *
 * @param {Retext} retext
 */

function attach(retext) {
    retext.TextOM.Node.prototype.update = update;
}

/**
 * Expose `attach`.
 */

live.attach = attach;

/**
 * Expose `plugin`.
 */

module.exports = live;
