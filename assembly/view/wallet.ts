import { Box } from "metashrew-as/assembly/utils/box";
import { parsePrimitive } from "metashrew-as/assembly/utils/utils";
import { input } from "metashrew-as/assembly/indexer";
import { arrayToArrayBuffer } from "metashrew-as/assembly/blockdata/address";
import { arrayBufferToArray } from "metashrew-as/assembly/indexer";
import { u128FromArrayBuffer, BRC20_INDEX } from "../brc20";
import { ordinals as protobuf } from "../protobuf";
import { OUTPOINTS_FOR_ADDRESS } from "metashrew-spendables/assembly/tables";
import { OutPoint } from "metashrew-as/assembly/blockdata/transaction";

export function brc20byaddress(): ArrayBuffer {
  const data = Box.from(input());
  parsePrimitive<u32>(data);
  const address = arrayToArrayBuffer(protobuf.Brc20ByAddressRequest.decode(
    input().slice(4)
  ).address);
  const tickers = BRC20_INDEX.keyword("tickers/")
    .select(address)
    .getList();
  const balances: Array<ArrayBuffer> = new Array<ArrayBuffer>();
  for (let i = 0; i < tickers.length; i++) {
    balances.push(BRC20_INDEX.select(tickers[i]).keyword("/balances/").select(address).get());
  }
  const outpointsByAddress = OUTPOINTS_FOR_ADDRESS.select(address).getList().map((v: ArrayBuffer, i: i32, ary: Array<ArrayBuffer>) => new OutPoint(Box.from(v)));
  const sequenceNumbers = outpointsByAddress.map((v: OutPoint, i: i32, ary: Array<OutPoint>) => BRC20_INDEX.keyword("/sequence/byoutpoint/").select(v.toArrayBuffer()).getValue<u64>());
  const brc20s = new Array<protobuf.Brc20>();
  const outpoints = new Array<protobuf.OutPoint>();
  const message = new protobuf.Brc20ByAddressResponse();

  for (let i = 0; i < tickers.length; i++) {
    brc20s.push({
      tick: arrayBufferToArray(tickers[i]),
      balance: u128FromArrayBuffer(balances[i]).toU64(),
    });
  }

  for (let i = 0; i < outpointsByAddress.length; i++) {
    if (sequenceNumbers[i] !== 0) {
      outpoints.push({
        hash: arrayBufferToArray(outpointsByAddress[i].txid.toArrayBuffer()),
	sequence: sequenceNumbers[i],
        vout: outpointsByAddress[i].index,
      });
    }
  }
  message.brc20s = brc20s;
  message.outpoints = outpoints;

  return message.encode();
}
