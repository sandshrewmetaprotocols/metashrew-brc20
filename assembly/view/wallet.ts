import { u128 } from "as-bignum";
import { BRC20_INDEX } from "../brc20";
import { input } from "metashrew-as/assembly/indexer";
import { brc20 as protobuf } from "../../proto/brc20";

export function brc20byaddress(): ArrayBuffer {
  const _address = protobuf.WalletRequest.decode(input().slice(4)).wallet;
  const address = changetype<Uint8Array>(_address).buffer;

  const brc20s = new Array(
    BRC20_INDEX.keyword("/tickers/").select(address).get()
  );
  const balances = new Array(
    BRC20_INDEX.keyword("/balances/").select(address).get()
  );

  const balanceSheets = new Map<ArrayBuffer, u128>();
  for (let i = 0; i < brc20s.length; i++) {
    balanceSheets.set(brc20s[i], u128.from(balances[i]));
  }

  return mapToArrayBuffer(balanceSheets);
}

function mapToArrayBuffer(map: Map<ArrayBuffer, u128>): ArrayBuffer {
  // Step 1: Calculate total size required for the ArrayBuffer
  let totalSize: usize = 0;

  // Each key is an ArrayBuffer and each value is a u128 (16 bytes)
  for (let [key, value] of map) {
    totalSize += key.byteLength; // size of ArrayBuffer (key)
    totalSize += 16; // size of u128 (value)
  }

  // Step 2: Allocate a new ArrayBuffer of the required size
  let buffer = new ArrayBuffer(totalSize);
  let pointer = changetype<usize>(buffer); // Pointer to start of the buffer

  // Step 3: Serialize each key (ArrayBuffer) and value (u128)
  for (let [key, value] of map) {
    // Copy the key (ArrayBuffer) into the buffer
    memory.copy(pointer, changetype<usize>(key), key.byteLength);
    pointer += key.byteLength;

    // Store the value (u128) in the buffer
    store<u128>(pointer, value);
    pointer += 16; // Advance pointer by size of u128
  }

  return buffer;
}
