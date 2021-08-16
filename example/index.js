import assert from 'assert';
import * as spake2 from "spake2-wasm";

let appid = 'myapp/v1';
let password = 'pineapple sausage';

let Astate = spake2.start(appid, password);
let Amsg = spake2.msg(Astate)

let Bstate = spake2.start(appid, password);
let Bmsg = spake2.msg(Bstate)

let Akey = spake2.finish(Astate,Bmsg);
let Bkey = spake2.finish(Bstate,Amsg);

assert(Akey.toString('hex') === Bkey.toString('hex'));


