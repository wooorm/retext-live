'use strict';

var live,
    Retext,
    assert;

/**
 * Dependencies.
 */

live = require('./');
Retext = require('retext');
assert = require('assert');

/**
 * Retext.
 */

var retext,
    TextOM,
    parser;

retext = new Retext().use(live);
TextOM = retext.TextOM;
parser = retext.parser;

/**
 * Unit tests.
 */

describe('retext-live', function () {
    it('should be a `function`', function () {
        assert(typeof live === 'function');
    });

    it('should attach an `update` method to `Node`', function () {
        assert(typeof (new TextOM.Node()).update === 'function');
    });
});

describe('Node#update()', function () {
    it('should throw when not operating on a node', function () {
        assert.throws(function () {
            TextOM.Node.prototype.update.call({}, 'Alfred');
        }, /non-node/);
    });

    it('should throw when not operating on `Parent` or `Text`', function () {
        var node;

        node = new TextOM.Node();

        assert.throws(function () {
            node.update('Alfred');
        }, /non-parent/);
    });

    it('should throw when not operating on a known node', function () {
        var node;

        node = new TextOM.WordNode();

        node.type = 'SomeUnknownNode';

        assert.throws(function () {
            node.update('Alfred');
        }, /not a valid context object/);
    });
});

describe('Node#update(string)', function () {
    it('should work on a `Text`', function () {
        var node;

        node = new TextOM.TextNode('Alfred');

        node.update('Bertrand');

        assert(node.toString() === 'Bertrand');
    });

    it('should work when inserting clean text', function () {
        var node;

        node = new TextOM.RootNode();

        node.update('Some English words.');

        assert(node.toString() === 'Some English words.');
    });

    it('should work when removing all text', function (done) {
        retext.parse('Some English words.', function (err, tree) {
            tree.update('');

            assert(tree.toString() === '');
            assert(tree.head === null);

            done(err);
        });
    });

    it('should work when no changes occured', function (done) {
        var fixture;

        fixture = 'Some English words.';

        retext.parse(fixture, function (err, tree) {
            var sentence,
                first,
                second,
                third,
                fourth,
                fifth,
                sixth;

            sentence = tree.head.head;
            first = sentence.head;
            second = sentence[1];
            third = sentence[2];
            fourth = sentence[3];
            fifth = sentence[4];
            sixth = sentence.tail;

            tree.update(fixture);

            assert(sentence === tree.head.head);
            assert(first === sentence.head);
            assert(second === sentence[1]);
            assert(third === sentence[2]);
            assert(fourth === sentence[3]);
            assert(fifth === sentence[4]);
            assert(sixth === sentence.tail);

            done(err);
        });
    });

    it('should work when appending text', function (done) {
        var source,
            update;

        source = 'Some English';
        update = source + ' words.';

        retext.parse(source, function (err, tree) {
            var sentence,
                first,
                second,
                third;

            sentence = tree.head.head;

            first = sentence.head;
            second = first.next;
            third = second.next;

            sentence.update(update);

            assert(sentence.head === first);
            assert(first.toString() === 'Some');
            assert(first.next === second);
            assert(second.toString() === ' ');
            assert(second.next === third);
            assert(third.toString() === 'English');

            assert(third.next.type === TextOM.WHITE_SPACE_NODE);
            assert(third.next.toString() === ' ');
            assert(third.next.next.type === TextOM.WORD_NODE);
            assert(third.next.next.toString() === 'words');
            assert(third.next.next.next === sentence.tail);
            assert(sentence.tail.type === TextOM.PUNCTUATION_NODE);
            assert(sentence.tail.toString() === '.');

            done(err);
        });
    });

    it('should work when prepending text', function (done) {
        var source,
            update;

        source = 'English words.';
        update = 'Some ' + source;

        retext.parse(source, function (err, tree) {
            var sentence,
                first,
                second,
                third;

            sentence = tree.head.head;

            first = sentence.head;
            second = first.next;
            third = second.next;

            sentence.update(update);

            assert(sentence.head === first);
            assert(first.toString() === 'Some');
            assert(first.next === second);
            assert(second.toString() === ' ');
            assert(second.next === third);
            assert(third.toString() === 'English');

            assert(third.next.toString() === ' ');
            assert(third.next.type === TextOM.WHITE_SPACE_NODE);
            assert(third.next.next.toString() === 'words');
            assert(third.next.next.type === TextOM.WORD_NODE);

            assert(third.next.next.next === sentence.tail);
            assert(sentence.tail.toString() === '.');
            assert(sentence.tail.type === TextOM.PUNCTUATION_NODE);

            done(err);
        });
    });

    it('should work when inserting text', function (done) {
        var before,
            inside,
            after,
            source,
            update;

        before = 'Some ';
        inside = 'English ';
        after = 'words.';

        source = before + after;
        update = before + inside + after;

        retext.parse(source, function (err, tree) {
            var sentence,
                first,
                second,
                third;

            sentence = tree.head.head;

            first = sentence.head;
            second = first.next;
            third = second.next;

            sentence.update(update);

            assert(sentence.head === first);
            assert(first.toString() === 'Some');
            assert(first.next === second);
            assert(second.toString() === ' ');

            assert(second.next === third);
            assert(third.toString() === 'English');

            assert(third.next.toString() === ' ');
            assert(third.next.type === TextOM.WHITE_SPACE_NODE);

            assert(third.next.next.toString() === 'words');
            assert(third.next.next.type === TextOM.WORD_NODE);

            assert(third.next.next.next === sentence.tail);
            assert(sentence.tail.toString() === '.');
            assert(sentence.tail.type === TextOM.PUNCTUATION_NODE);

            done(err);
        });
    });

    it('should work when replacing text', function (done) {
        var before,
            deletion,
            addition,
            after,
            source,
            update;

        before = 'Some ';
        deletion = 'French';
        addition = 'English';
        after = ' words.';

        source = before + deletion + after;
        update = before + addition + after;

        retext.parse(source, function (err, tree) {
            var sentence,
                first,
                second,
                third,
                fourth,
                fifth,
                sixth;

            sentence = tree.head.head;

            first = sentence.head;
            second = first.next;
            third = second.next;
            fourth = third.next;
            fifth = fourth.next;
            sixth = fifth.next;

            sentence.update(update);

            assert(sentence.head === first);
            assert(first.toString() === 'Some');
            assert(first.next === second);
            assert(second.toString() === ' ');

            assert(second.next === third);
            assert(third.toString() === 'English');

            assert(third.next === fourth);
            assert(fourth.toString() === ' ');

            assert(fourth.next === fifth);
            assert(fifth.toString() === 'words');

            assert(fifth.next === sixth);
            assert(sixth.toString() === '.');

            done(err);
        });
    });
});

describe('Node#update(nlcst)', function () {
    it('should throw when the given object\'s type is not equal to the ' +
        'operated on node\'s type',
        function () {
            var node;

            node = new TextOM.WordNode();

            assert.throws(function () {
                node.update({
                    'type' : 'SentenceNode',
                    'children' : []
                });
            }, /Incorrect NLCST/);
        }
    );

    it('should work on a `Text`', function () {
        var node;

        node = new TextOM.TextNode('Alfred');

        node.update({
            'type' : 'TextNode',
            'value' : 'Bertrand'
        });

        assert(node.toString() === 'Bertrand');
    });

    it('should ignore `data` properties', function () {
        var node;

        node = new TextOM.WordNode();

        node.data.stem = 'eric';

        node.update({
            'type' : 'WordNode',
            'children' : []
        });

        assert(node.data.stem === 'eric');
    });

    it('should work when inserting clean text', function () {
        var node;

        node = new TextOM.SentenceNode();

        node.update({
            'type' : 'SentenceNode',
            'children' : [
                {
                    'type' : 'WordNode',
                    'children' : [
                        {
                            'type' : 'TextNode',
                            'value' : 'Some'
                        }
                    ]
                },
                {
                    'type' : 'WhiteSpaceNode',
                    'value' : ' '
                },
                {
                    'type' : 'WordNode',
                    'children' : [
                        {
                            'type' : 'TextNode',
                            'value' : 'English'
                        }
                    ]
                },
                {
                    'type' : 'WhiteSpaceNode',
                    'value' : ' '
                },
                {
                    'type' : 'WordNode',
                    'children' : [
                        {
                            'type' : 'TextNode',
                            'value' : 'words'
                        }
                    ]
                },
                {
                    'type' : 'PunctuationNode',
                    'value' : '.'
                }
            ]
        });

        assert(node.toString() === 'Some English words.');
    });

    it('should work when removing all text', function (done) {
        retext.parse('Some English words.', function (err, tree) {
            tree.update({
                'type' : 'RootNode',
                'children' : []
            });

            assert(tree.toString() === '');
            assert(tree.head === null);

            done(err);
        });
    });

    it('should work when no changes occured', function (done) {
        retext.parse('Some English words.', function (err, tree) {
            var sentence,
                first,
                second,
                third,
                fourth,
                fifth,
                sixth;

            sentence = tree.head.head;
            first = sentence.head;
            second = sentence[1];
            third = sentence[2];
            fourth = sentence[3];
            fifth = sentence[4];
            sixth = sentence.tail;

            tree.update(tree.valueOf());

            assert(sentence === tree.head.head);
            assert(first === sentence.head);
            assert(second === sentence[1]);
            assert(third === sentence[2]);
            assert(fourth === sentence[3]);
            assert(fifth === sentence[4]);
            assert(sixth === sentence.tail);

            done(err);
        });
    });

    it('should work when appending text', function (done) {
        var source,
            fixture;

        source = 'Some English';

        fixture = parser.parse(source + ' words.').children[0].children[0];

        retext.parse(source, function (err, tree) {
            var sentence,
                first,
                second,
                third;

            sentence = tree.head.head;

            first = sentence.head;
            second = first.next;
            third = second.next;

            sentence.update(fixture);

            assert(sentence.head === first);
            assert(first.toString() === 'Some');
            assert(first.next === second);
            assert(second.toString() === ' ');
            assert(second.next === third);
            assert(third.toString() === 'English');

            assert(third.next.type === TextOM.WHITE_SPACE_NODE);
            assert(third.next.toString() === ' ');
            assert(third.next.next.type === TextOM.WORD_NODE);
            assert(third.next.next.toString() === 'words');
            assert(third.next.next.next === sentence.tail);
            assert(sentence.tail.type === TextOM.PUNCTUATION_NODE);
            assert(sentence.tail.toString() === '.');

            done(err);
        });
    });

    it('should work when prepending text', function (done) {
        var source,
            fixture;

        source = 'English words.';

        fixture = parser.parse('Some ' + source).children[0].children[0];

        retext.parse(source, function (err, tree) {
            var sentence,
                first,
                second,
                third;

            sentence = tree.head.head;

            first = sentence.head;
            second = first.next;
            third = second.next;

            sentence.update(fixture);

            assert(sentence.head === first);
            assert(first.toString() === 'Some');
            assert(first.next === second);
            assert(second.toString() === ' ');
            assert(second.next === third);
            assert(third.toString() === 'English');

            assert(third.next.toString() === ' ');
            assert(third.next.type === TextOM.WHITE_SPACE_NODE);
            assert(third.next.next.toString() === 'words');
            assert(third.next.next.type === TextOM.WORD_NODE);

            assert(third.next.next.next === sentence.tail);
            assert(sentence.tail.toString() === '.');
            assert(sentence.tail.type === TextOM.PUNCTUATION_NODE);

            done(err);
        });
    });

    it('should work when inserting text', function (done) {
        var before,
            inside,
            after,
            source,
            fixture;

        before = 'Some ';
        inside = 'English ';
        after = 'words.';

        source = before + after;

        fixture = parser.parse(before + inside + after).children[0]
            .children[0];

        retext.parse(source, function (err, tree) {
            var sentence,
                first,
                second,
                third;

            sentence = tree.head.head;

            first = sentence.head;
            second = first.next;
            third = second.next;

            sentence.update(fixture);

            assert(sentence.head === first);
            assert(first.toString() === 'Some');
            assert(first.next === second);
            assert(second.toString() === ' ');

            assert(second.next === third);
            assert(third.toString() === 'English');

            assert(third.next.toString() === ' ');
            assert(third.next.type === TextOM.WHITE_SPACE_NODE);

            assert(third.next.next.toString() === 'words');
            assert(third.next.next.type === TextOM.WORD_NODE);

            assert(third.next.next.next === sentence.tail);
            assert(sentence.tail.toString() === '.');
            assert(sentence.tail.type === TextOM.PUNCTUATION_NODE);

            done(err);
        });
    });

    it('should work when replacing text', function (done) {
        var before,
            deletion,
            addition,
            after,
            source,
            fixture;

        before = 'Some ';
        deletion = 'French';
        addition = 'English';
        after = ' words.';

        source = before + deletion + after;

        fixture = parser.parse(before + addition + after).children[0]
            .children[0];

        retext.parse(source, function (err, tree) {
            var sentence,
                first,
                second,
                third,
                fourth,
                fifth,
                sixth;

            sentence = tree.head.head;

            first = sentence.head;
            second = first.next;
            third = second.next;
            fourth = third.next;
            fifth = fourth.next;
            sixth = fifth.next;

            sentence.update(fixture);

            assert(sentence.head === first);
            assert(first.toString() === 'Some');
            assert(first.next === second);
            assert(second.toString() === ' ');

            assert(second.next === third);
            assert(third.toString() === 'English');

            assert(third.next === fourth);
            assert(fourth.toString() === ' ');

            assert(fourth.next === fifth);
            assert(fifth.toString() === 'words');

            assert(fifth.next === sixth);
            assert(sixth.toString() === '.');

            done(err);
        });
    });
});

describe('Bugginess', function () {
    it('should not fail when an error occurs in the diff application ' +
        'algorithm',
        function (done) {
            retext.parse('Alfred .', function (err, tree) {
                tree.update('Alfred bertrand.');

                assert(tree.toString() === 'Alfred bertrand.');

                done(err);
            });
        }
    );
});
