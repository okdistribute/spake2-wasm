# spake2-wasm

This is a WASM port of the [Rust library](https://docs.rs/spake2/0.2.0/spake2/) for the [SPAKE2 algorithm](https://tools.ietf.org/id/draft-irtf-cfrg-spake2-10.html). SPAKE2 is a secure method for deriving a shared secret from a low entropy password.

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

See how to use this in the browser in the [example](/example) directory.


## Building

Ensure you have `rust` and `cargo`, and a modern `clang`.

Install `wasm-pack`:

```sh
cargo install wasm-pack
```

Then build:

```sh
npm run release
```

## `No available targets are compatible with triple "wasm32-unknown-unknown"`

This error indicates your clang is out of date: for example, you're on MacOS using the built-in version.

On a mac you can fix this with

```sh
brew install llvm
```

And then prefixing the `wasm-pack` command as follows:

```sh
PATH=/usr/local/opt/llvm/bin:$PATH wasm-pack build --target=nodejs
```

## Dev notes

We need to explicitly specify `rand = { version = "0.6", features = ["wasm-bindgen"] }` in order for `spake2` to work (specifically the feature flag). Otherwise it panics at runtime.

## Acknowledgments

Thanks to this [Node.js port of Magic Wormhole](https://github.com/bakkot/magic-wormhole-js) for the details necessary to get spake2 running in wasm.
