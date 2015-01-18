'use strict';

var Retext,
    retextLive;

/*
 * Dependencies.
 */

Retext = require('retext');
retextLive = require('./');

/*
 * Dependencies.
 */

var retext;

retext = new Retext().use(retextLive);

/*
 * Test data: A (big?) article (w/ 100 paragraphs, 500
 * sentences, 10,000 words);
 *
 * Source:
 *   http://www.gutenberg.org/files/10745/10745-h/10745-h.htm
 */

var sentence,
    paragraph,
    section,
    article,
    sectionNode,
    articleNode,
    enters;

sentence = 'Where she had stood was clear, and she was gone since Sir ' +
    'Kay does not choose to assume my quarrel.';

paragraph = 'Thou art a churlish knight to so affront a lady ' +
    'he could not sit upon his horse any longer. ' +
    'For methinks something hath befallen my lord and that he ' +
    'then, after a while, he cried out in great voice. ' +
    'For that light in the sky lieth in the south ' +
    'then Queen Helen fell down in a swoon, and lay. ' +
    'Touch me not, for I am not mortal, but Fay ' +
    'so the Lady of the Lake vanished away, everything behind. ' +
    sentence;

enters = '\n\n';

section = paragraph + Array(10).join(enters + paragraph);

article = section + Array(10).join(enters + section);

/**
 * Create a section.
 *
 * @param {function(Error?)} done
 */
function createSection(done) {
    retext.parse(section, function (err, tree) {
        sectionNode = tree;

        done(err);
    });
}

/**
 * Create an article.
 *
 * @param {function(Error?)} done
 */
function createArticle(done) {
    retext.parse(article, function (err, tree) {
        articleNode = tree;

        done(err);
    });
}

set('concurrency', 1);

suite('TextOM.Node#update() on a section', function () {
    before(createSection);

    bench('Add and remove a paragraph to/from a section', function () {
        sectionNode.update(section + enters + paragraph);

        sectionNode.update(section);
    });
});

suite('TextOM.Node#update() on an article', function () {
    before(createArticle);

    bench('Add and remove a paragraph to/from an article', function () {
        articleNode.update(article + enters + paragraph);

        articleNode.update(article);
    });
});
