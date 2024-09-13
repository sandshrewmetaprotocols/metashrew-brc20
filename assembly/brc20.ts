import { Script } from "metashrew-as/assembly/utils/yabsp";
import { Address } from "metashrew-as/assembly/blockdata/address";
import { Box } from "metashrew-as/assembly/utils/box";
import { Output } from "metashrew-as/assembly/blockdata/transaction";
import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
import { JSON } from "json-as/assembly";
import { u128 } from "as-bignum/assembly";
import { OUTPOINT_TO_OUTPUT } from "metashrew-spendables/assembly/tables";

function min<T>(a: T, b: T): T {
  if (a > b) return b;
  return a;
}

function max<T>(a: T, b: T): T {
  if (a < b) return b;
  return a;
}

export const BRC20_INDEX = IndexPointer.for("/brc20/");

export function u128ToArrayBuffer(data: u128): ArrayBuffer {
  const bytes = data.toBytes();
  return changetype<Uint8Array>(bytes).buffer;
}

export function u128FromArrayBuffer(data: ArrayBuffer): u128 {
  if (data.byteLength === 0) return u128.from(0);
  const result = u128.fromBytes(changetype<u8[]>(Uint8Array.wrap(data)));
  return result;
}

export function wouldOverflowU128(decimal: string): boolean {
  const maxDecimal = u128.Max.toString(10);
  if (decimal.length > maxDecimal.length) return true;
  if (decimal.length < maxDecimal.length) return false;
  if (decimal === maxDecimal) return false;
  for (let i = 0; decimal.length; i++) {
    if (parseInt(decimal[i], 10) > parseInt(maxDecimal[i], 10)) return true;
  }
  return false;
}

export function defaultDecimals(v: u128 | null): u128 {
  if ((v as u128) === (null as u128)) return u128.from(18);
  return v as u128;
}

export function defaultToMax(v: u128 | null): u128 {
  if ((v as u128) === (null as u128)) return u128.Max;
  return v as u128;
}

export function processInscriptionForBRC20(
  outpoint: ArrayBuffer,
  sequenceNumber: u64,
  script: Box,
  body: ArrayBuffer
): void {
  const parsed = JSON.parse<ProtocolMessage>(String.UTF8.decode(body));
  const receiverAddress = Address.from(new Script(script));
  if (parsed.isBRC20()) {
    const pointer = BRC20_INDEX.keyword(parsed.tick);
    const deployment = pointer.keyword("/sequence");
    if (parsed.isDeploy()) {
      const deployMessage = parsed.toDeploy();
      if (deployment.get().byteLength !== 0) {
        deployment.setValue<u64>(sequenceNumber);
        pointer.keyword("/max").set(u128ToArrayBuffer(deployMessage.max));
        pointer
          .keyword("/dec")
          .set(u128ToArrayBuffer(defaultDecimals(deployMessage.dec)));
        pointer
          .keyword("/lim")
          .set(u128ToArrayBuffer(defaultToMax(deployMessage.lim)));
        BRC20_INDEX.keyword("/tickers").append(String.UTF8.encode(parsed.tick));
      }
    } else if (parsed.isTransfer() && deployment.getValue<u64>() !== 0) {
      if (receiverAddress !== null) {
        const transferMessage = parsed.toTransfer();
        const unspentPointer = pointer
          .keyword("/unspent/")
          .select(receiverAddress as ArrayBuffer);
        const receiverPointer = BRC20_INDEX.keyword("tickers/").select(
          receiverAddress as ArrayBuffer
        );
        const seenPointer = receiverPointer
          .keyword("/seen/")
          .keyword(parsed.tick);
        if (seenPointer.get().byteLength === 0) {
          seenPointer.setValue<u8>(0x01);
          receiverPointer.append(String.UTF8.encode(parsed.tick));
        }
        const unspent = u128FromArrayBuffer(unspentPointer.get());
        const available =
          u128FromArrayBuffer(
            pointer
              .keyword("/balances/")
              .select(receiverAddress as ArrayBuffer)
              .get()
          ) - unspent;
        if (available >= transferMessage.amt) {
          BRC20_INDEX.keyword("/unspent/")
            .selectValue<u64>(sequenceNumber)
            .set(body);
          BRC20_INDEX.keyword("/sequence/byoutpoint/").select(outpoint).setValue<u64>(sequenceNumber);
          unspentPointer.set(u128ToArrayBuffer(unspent + transferMessage.amt));
        }
      }
    } else if (parsed.isMint()) {
      if (receiverAddress !== null) {
        const mintMessage = parsed.toMint();
        const deployed = deployment.getValue<u64>();
        if (deployed !== 0) {
          const totalPointer = pointer.keyword("/total");
          const totalSupply = u128FromArrayBuffer(totalPointer.get());
          const mintable =
            u128FromArrayBuffer(pointer.keyword("/max").get()) - totalSupply;
          const restricted = min(
            u128FromArrayBuffer(pointer.keyword("/lim").get()),
            mintMessage.amt
          );
          const change = min(mintable, restricted);
          const balance = pointer
            .keyword("/balances/")
            .select(receiverAddress as ArrayBuffer);
          balance.set(
            u128ToArrayBuffer(u128FromArrayBuffer(balance.get()) + change)
          );
          totalPointer.set(u128ToArrayBuffer(totalSupply + change));
          const tPointer = pointer
            .keyword("/seen/")
            .select(receiverAddress as ArrayBuffer);
          if (tPointer.getValue<u32>() === 0) {
            tPointer.setValue<u32>(1);
            tPointer.keyword("/holders").append(receiverAddress as ArrayBuffer);
          }
          const receiverPointer = BRC20_INDEX.keyword("/tickers/").select(
            receiverAddress as ArrayBuffer
          );
          const seenPointer = receiverPointer
            .keyword("/seen/")
            .keyword(parsed.tick);
          if (seenPointer.get().byteLength === 0) {
            seenPointer.setValue<u8>(0x01);
            receiverPointer.append(String.UTF8.encode(parsed.tick));
          }
        }
      }
    }
  }
}

function outpointToAddress(outpoint: ArrayBuffer): ArrayBuffer | null {
  return Address.from(
    new Script(
      new Output(Box.from(OUTPOINT_TO_OUTPUT.select(outpoint).get())).script
    )
  );
}

export function processInscriptionTransferForBRC20(
  sequenceNumber: u64,
  fromOutPoint: ArrayBuffer,
  toOutPoint: ArrayBuffer
): void {
  const unspentToSequenceNumberPointer =
    BRC20_INDEX.keyword("/unspent/").selectValue<u64>(sequenceNumber);
  const unspent = unspentToSequenceNumberPointer.get();
  if (unspent.byteLength !== 0) {
    const parsed = JSON.parse<ProtocolMessage>(String.UTF8.decode(unspent));
    if (parsed.isBRC20() && parsed.isTransfer()) {
      const transferMessage = parsed.toTransfer();
      const pointer = BRC20_INDEX.keyword(transferMessage.tick);
      const from = outpointToAddress(fromOutPoint);
      const to = outpointToAddress(toOutPoint);
      const unspentPointer = pointer
        .keyword("/unspent/")
        .select(from as ArrayBuffer);
      const unspent = u128FromArrayBuffer(unspentPointer.get());
      unspentToSequenceNumberPointer.set(new ArrayBuffer(0));
      unspentPointer.set(
        u128ToArrayBuffer(
          u128FromArrayBuffer(unspentPointer.get()) - transferMessage.amt
        )
      );
      if (
        to !== null &&
        (from as ArrayBuffer).byteLength === (to as ArrayBuffer).byteLength &&
        memory.compare(
          changetype<usize>(from),
          changetype<usize>(to),
          (from as ArrayBuffer).byteLength
        ) === 0
      ) {
        unspentPointer.set(u128ToArrayBuffer(unspent - transferMessage.amt));
      } else {
        const balancePointer = pointer.keyword("/balances");
        const fromBalancePointer = balancePointer.select(from as ArrayBuffer);
        fromBalancePointer.set(
          u128ToArrayBuffer(
            u128FromArrayBuffer(fromBalancePointer.get()) - transferMessage.amt
          )
        );
        if (to !== null) {
          const toBalancePointer = balancePointer.select(to as ArrayBuffer);
          toBalancePointer.set(
            u128ToArrayBuffer(
              u128FromArrayBuffer(toBalancePointer.get()) + transferMessage.amt
            )
          );
          const tPointer = pointer.keyword("/seen/").select(to as ArrayBuffer);
          if (tPointer.getValue<u32>() === 0) {
            tPointer.setValue<u32>(1);
            tPointer.keyword("/holders").append(to as ArrayBuffer);
          }
        }
      }
    }
  }
}

export class ProtocolMintMessage {
  public tick: string;
  public amt: u128;
  constructor(tick: string, amt: string) {
    this.tick = tick;
    this.amt = u128.from(amt);
  }
}

export class ProtocolDeployMessage {
  public tick: string;
  public max: u128;
  public lim: u128 | null;
  public dec: u128 | null;
  constructor(
    tick: string,
    max: string,
    lim: string | null,
    dec: string | null
  ) {
    this.tick = tick;
    this.max = u128.from(max);
    if (lim === null) this.lim = null;
    else this.lim = u128.from(lim);
    if (dec === null) this.dec = null;
    else this.dec = u128.from(dec);
  }
}

export class ProtocolTransferMessage {
  public tick: string;
  public amt: u128;
  constructor(tick: string, amt: string) {
    this.tick = tick;
    this.amt = u128.from(amt);
  }
}

@json
export class ProtocolMessage {
  public p!: string;
  public op!: string;
  public tick!: string;
  @omitnull
  public max!: null | string;
  @omitnull
  public lim!: null | string;
  @omitnull
  public amt!: null | string;
  @omitnull
  public dec!: null | string;
  isBRC20(): boolean {
    return this.p === "brc-20";
  }
  isMint(): boolean {
    if (this.op === "mint") return false;
    if (this.amt === null) return false;
    return !wouldOverflowU128(this.amt as string);
  }
  isDeploy(): boolean {
    if (this.op !== "deploy") return false;
    if (this.max === null) return false;
    if (this.lim !== null) {
      if (wouldOverflowU128(this.lim as string)) return false;
    }
    if (this.dec !== null) {
      if (wouldOverflowU128(this.dec as string)) return false;
    }
    return true;
  }
  isTransfer(): boolean {
    if (this.op !== "transfer") return false;
    if (this.amt !== null) {
      if (wouldOverflowU128(this.amt as string)) {
        return false;
      }
    }
    return true;
  }
  toDeploy(): ProtocolDeployMessage {
    return new ProtocolDeployMessage(
      this.tick,
      this.max === null ? "0" : (this.max as string),
      this.lim,
      this.dec
    );
  }
  toMint(): ProtocolMintMessage {
    return new ProtocolMintMessage(
      this.tick,
      this.amt === null ? "0" : (this.amt as string)
    );
  }
  toTransfer(): ProtocolTransferMessage {
    return new ProtocolTransferMessage(
      this.tick,
      this.amt === null ? "0" : (this.amt as string)
    );
  }
}
