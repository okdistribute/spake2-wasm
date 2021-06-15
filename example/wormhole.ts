import { Client } from '@localfirst/relay-client';
import { randomBytes } from 'crypto';
import createHash from 'create-hash';
import * as bip from 'bip39';
import debug from 'debug';
import { serialize, deserialize } from 'bson';
import { symmetric, EncryptedProtocolMessage } from './crypto';

let VERSION = 1;
let appid = 'my-spake2/app/v1';

export class Wormhole {
  client: Client;
  log: debug;

  constructor(client) {
    this.client = client;
    this.log = debug('bc:wormhole');
  }

  async getCode(lang?: string) {
    if (lang) {
      bip.setDefaultWordlist(lang);
    }
    let passwordPieces = bip
      .entropyToMnemonic(randomBytes(32))
      .split(' ');
    let password = passwordPieces.filter((p) => p !== '').slice(0, 3);
    if (password.length < 3) return this.getCode(lang);
    else return password.join('-');
  }

  /**
   * Turn a code into it's parts
   * @param code
   * @returns An array of two strings, [discoveryKey, password]
   */
  private _codeToParts(code: string): [string, string] {
    let parts = code.split('-');
    let nameplate = parts.shift();
    let discoveryKey = `wormhole-${nameplate}`;
    let password = parts.join('-');
    return [discoveryKey, password];
  }

  leave(code: string) {
    let [discoveryKey] = this._codeToParts(code);
    this.client.leave(discoveryKey);
  }

  async accept(code: string): Promise<string> {
    let [discoveryKey, password] = this._codeToParts(code);
    return new Promise((resolve, reject) => {
      let listener = onPeerConnect.bind(this);
      this.log('joining', discoveryKey);
      this.client.join(discoveryKey).on('peer.connect', listener);

      function onPeerConnect({ socket, documentId }) {
        this.log('onPeerConnect', documentId);
        if (documentId === discoveryKey) {
          let spake2State = window.spake2.start(appid, password);
          let outbound = window.spake2.msg(spake2State);
          let outboundString = Buffer.from(outbound).toString('hex');

          socket.binaryType = 'arraybuffer';
          socket.send(outboundString);
          let key: string = null;

          let onmessage = async (e) => {
            let msg = e.data;
            if (!key) {
              let inbound = Buffer.from(msg, 'hex');
              let array: Uint8Array = window.spake2.finish(
                spake2State,
                inbound
              );
              key = Buffer.from(array).toString('hex');
              let encryptedMessage: EncryptedProtocolMessage = await symmetric.encrypt(
                key,
                JSON.stringify({ version: VERSION })
              );
              socket.send(serialize(encryptedMessage));
            } else {
              let decoded = deserialize(msg) as EncryptedProtocolMessage;
              try {
                let plainText = await symmetric.decrypt(key, decoded);
                let json = JSON.parse(plainText);
                this.log('got version', json.version);
                if (json.version !== VERSION) {
                  reject(
                    new Error(
                      'Secure connection established, but you or your contact are using an outdated version of Backchannel and need to upgrade.'
                    )
                  );
                } else {
                  resolve(key);
                }
              } catch (err) {
                this.log('error', err);
                reject(err);
              } finally {
                socket.removeEventListener('peer.connect', listener);
                socket.removeEventListener('message', onmessage);
                this.client.leave(discoveryKey);
                socket.close();
              }
            }
          };
          socket.addEventListener('message', onmessage);
        }
      }
    });
  }
}
