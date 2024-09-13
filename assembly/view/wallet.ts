import { BRC20_INDEX } from "../brc20";
import { input } from "metashrew-as/assembly/indexer";
import { ordinals } from "../protobuf";
import { Brc20ByAddressResponse } from "../../src.ts/ordinals";

export function brc20byaddress(): ArrayBuffer {
  const _address = ordinals.Brc20ByAddressRequest.decode(
    input().slice(4)
  ).address;
  const address = changetype<Uint8Array>(_address).buffer;
  const balances = BRC20_INDEX.keyword("/balances/").select(address).getList();
  const brc20Tickers = BRC20_INDEX.keyword("/tickers/")
    .select(address)
    .getList();
  const outpointsByAddress = BRC20_INDEX.keyword("/outpoints/")
    .select(address)
    .getList();
  const brc20s = new Array<ordinals.Brc20>();
  const outpoints = new Array<ordinals.OutPoint>();
  const message = new ordinals.Brc20ByAddressResponse();

  for (let i = 0; i < brc20Tickers.length; i++) {
    brc20s.push({
      tick: brc20Tickers[i],
      balance: balances[i],
    });
  }

  for (let i = 0; i < outpointsByAddress.length; i++) {
    outpoints.push({
      hash: outpointsByAddress[i],
      vout: outpointsByAddress[i],
    });
  }
  message.brc20s = brc20s;
  message.outpoints = outpoints;

  return message.encode();
}

export function decodeBrc20ByAddressResponse(hex: string): {
  outpoints: Array<{
    hash: string;
    vout: u32;
  }>;
  brc20s: Array<{
    tick: string;
    balance: u64;
  }>;
} {
  if (!hex || hex === "0x") {
    return { brc20s: [], outpoints: [] };
  }
  const buffer = Buffer.from(stripHexPrefix(hex), "hex");
  if (buffer.length === 0) {
    return { brc20s: [], outpoints: [] };
  }
  const response = Brc20ByAddressResponse.fromBinary(buffer);

  return {
    brc20s: response.brc20S.map((brc20) => ({
      tick: Buffer.from(brc20.tick).toString("utf8"),
      balance: brc20.balance,
    })),
    outpoints: response.outpoints.map((outpoint) => ({
      hash: Buffer.from(outpoint.hash).toString("utf8"),
      vout: outpoint.vout,
    })),
  };
}
