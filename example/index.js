'use strict';

var live,
    dom,
    emoji,
    smartypants,
    Retext;

/**
 * Dependencies.
 */

live = require('..');
emoji = require('retext-emoji');
smartypants = require('retext-smartypants');
dom = require('retext-dom');
Retext = require('retext');

/**
 * Retext.
 */

var retext;

retext = new Retext()
    .use(live)
    .use(dom)
    .use(emoji({
        'convert' : 'encode'
    }))
    .use(smartypants({
        'dashes' : 'oldschool'
    }));

/**
 * DOM
 */

var $textarea,
    $output;

$textarea = document.getElementsByTagName('textarea')[0];
$output = document.getElementsByTagName('div')[0];

retext.parse($textarea.value, function (err, tree) {
    if (err) {
        throw err;
    }

    $output.appendChild(tree.toDOMNode());

    $textarea.addEventListener('input', function () {
        tree.update($textarea.value);
    });
});
