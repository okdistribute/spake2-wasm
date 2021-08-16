# spake2-wasm

This is a Node.js/WASM port of the [SPAKE2 algorithm](https://tools.ietf.org/id/draft-irtf-cfrg-spake2-10.html). SPAKE2 is a secure method for deriving a shared secret from a low entropy password.

For the default security level each message is 33 bytes long. The resulting secrets are Ed25519 elliptic curve keys, roughly equivalent to an 128-bit symmetric key.

[Read the Rust library documentation for more information on how this works, it's pretty good!](https://docs.rs/spake2/0.2.0/spake2/)

It also works in the browser! See how to use this in the browser in the [example](/example) directory.

## Installation

```
npm i spake2-wasm
```

## Usage

```js
import * as spake2 from "spake2-wasm";

let appid = 'myapp/v1';
let password = 'pineapple sausage';

// peer A sends start message
let Astate = spake2.start(appid, password);
let Amsg = spake2.msg(Astate)

// peer B sends start message
let Bstate = spake2.start(appid, password);
let Bmsg = spake2.msg(Bstate)

// Both sides receive the start message and generate a key
let Akey = spake2.finish(Astate, Bmsg);
let Bkey = spake2.finish(Bstate, Amsg);

// These resulting secret keys should be the same
console.log(Akey.toString('hex') === Bkey.toString('hex'))
```

## Acknowledgments

Thanks to this [Node.js port of Magic Wormhole](https://github.com/bakkot/magic-wormhole-js) for the details necessary to get spake2 running in wasm.

## License

MIT
