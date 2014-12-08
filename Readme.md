# retext-live [![Build Status](https://img.shields.io/travis/wooorm/retext-live.svg?style=flat)](https://travis-ci.org/wooorm/retext-live) [![Coverage Status](https://img.shields.io/coveralls/wooorm/retext-live.svg?style=flat)](https://coveralls.io/r/wooorm/retext-live?branch=master)

Change a node based on (new) input.

Tries to be smart about things; only inserting new nodes where needed, removing what does not exists, updating text, and more.

> Note, the current diff algorithm is pretty proof-of-concept. Errors occur. When they do the tree is completely re-rendered.

## Installation

npm:
```sh
$ npm install retext-live
```

Component:
```sh
$ component install wooorm/retext-live
```

Bower:
```sh
$ bower install retext-live
```

## Usage

```js
var Retext = require('retext');
var live = require('retext-live');

var retext = new Retext().use(live);

var $textarea = document.getElementsByTagName('textarea')[0];

retext.parse('Some English words.', function (err, tree) {
    if (err) {
        throw err;
    }

    $textarea.addEventListener('input', function () {
        tree.update($textarea.value);
    });
});
```

## API

### [TextOM.Node](https://github.com/wooorm/textom#textomnode-nlcstnode)#update()

Update a node based on the changes between its current value and the new value.

- `TextOM.Node#update(string)` — Parses the given value and applies changes (if any) to the context;
- `TextOM.Node#update(nlcst)` — Applies changes (if any) to the context;

## License

MIT © [Titus Wormer](http://wooorm.com)
