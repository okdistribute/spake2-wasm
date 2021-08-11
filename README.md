# spake2-wasm

This is a WASM port of the Rust library for SPAKE2 algorithm. SPAKE2 is
a secure method for generating a shared secret between two devices derived from
a low entropy password. 

## Usage

```js
import * as spake2 from 'spake2-wasm'

spake2.start()
spake2.msg()
spake2.finish()
```


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
