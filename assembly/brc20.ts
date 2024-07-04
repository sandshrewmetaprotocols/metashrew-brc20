import { JSON } from "json-as/assembly";
import { u128 } from "as-bignum/assembly";

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
