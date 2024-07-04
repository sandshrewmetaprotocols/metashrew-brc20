import { Script } from "metashrew-as/assembly/utils/yabsp";
import { Box } from "metashrew-as/assembly/utils/box";
import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
import { JSON } from "json-as/assembly";
import { u128 } from "as-bignum/assembly";

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

export function processInscriptionForBRC20(sequenceNumber: u64, script: ArrayBuffer, body: ArrayBuffer): void {
  const parsed = JSON.parse<ProtocolMessage>(String.UTF8.decode(body));
  const receiverAddress = new Script(Box.from(script)).intoAddress();
  if (parsed.isBRC20()) {
    const pointer = BRC20_INDEX.keyword(parsed.tick);
    const deployment = pointer.keyword("/sequence");
    if (parsed.isDeploy()) {
      const deployMessage = parsed.toDeploy();
      if (deployment.get().byteLength !== 0) {
	deployment.setValue<u64>(sequenceNumber)
	pointer.keyword("/max").set(u128ToArrayBuffer(deployMessage.max));
	pointer.keyword("/dec").set(u128ToArrayBuffer(deployMessage.dec === null ? u128.from(18) : deployMessage.dec));
	pointer.keyword("/lim").set(u128ToArrayBuffer(deployMessage.lim === null ? u128.Max : deployMessage.lim));
      }
    } else if (parsed.isTransfer()) {
      const transferMessage = parsed.toTransfer();
      const unspentPointer = pointer.select("/unspent/").keyword(receiverAddress);
      const unspent = u128FromArrayBuffer(unspentPointer.get());
      const available = u128FromArrayBuffer(pointer.keyword("/balances/").keyword(receiverAddress).get()) - unspent;
      if (available >= transferMessage.amt) {
        BRC20_INDEX.select("/unspent/").selectValue<u64>(sequenceNumber).set(body);
	unspentPointer.set(u128ToArrayBuffer(unspent + transferMessage.amt));
      }
    } else if (parsed.isMint()) {
      const mintMessage = parsed.toMint();
      const deployed = deployment.getValue<u64>();
      if (deployed !== 0) {
        const totalPointer = pointer.keyword("/total");
	const totalSupply = u128FromArrayBuffer(totalPointer.get());
        const mintable = u128FromArrayBuffer(pointer.keyword("/max").get()) - totalSupply;
	const restricted = min(u128FromArrayBuffer(pointer.keyword("/lim")), mintMessage.amt);
	const change = min(mintable, restricted);
	const balance = pointer.keyword("/balances/").keyword(receiverAddress);
	balance.set(u128ToArrayBuffer(u128FromArrayBuffer(balance.get()) + change));
	totalPointer.set(u128ToArrayBuffer(totalSupply + change));
	const tPointer = pointer.keyword("/seen/").keyword(receiverAddress);
	if (tPointer.getValue<u32>() === 0) {
          tPointer.setValue<u32>(1);
          tPointer.keyword("/holders").append(String.UTF8.encode(receiverAddress));
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
  constructor(tick: string, max: string, lim: string | null, dec: string | null) {
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
    return new ProtocolDeployMessage(this.tick, this.max === null ? "0" : this.max as string, this.lim, this.dec);
  }
  toMint(): ProtocolMintMessage {
    return new ProtocolMintMessage(this.tick, this.amt === null ? "0" : this.amt as string);
  }
  toTransfer(): ProtocolTransferMessage {
    return new ProtocolTransferMessage(this.tick, this.amt === null ? "0" : this.amt as string);
  }
}
