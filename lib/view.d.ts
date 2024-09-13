import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message ordinals.OutPoint
 */
export interface OutPoint {
    /**
     * @generated from protobuf field: bytes hash = 1;
     */
    hash: Uint8Array;
    /**
     * @generated from protobuf field: uint32 vout = 2;
     */
    vout: number;
    /**
     * @generated from protobuf field: uint64 sequence = 3;
     */
    sequence: bigint;
}
/**
 * @generated from protobuf message ordinals.SatRange
 */
export interface SatRange {
    /**
     * @generated from protobuf field: uint64 start = 1;
     */
    start: bigint;
    /**
     * @generated from protobuf field: uint64 distance = 2;
     */
    distance: bigint;
}
/**
 * @generated from protobuf message ordinals.SatRanges
 */
export interface SatRanges {
    /**
     * @generated from protobuf field: repeated ordinals.SatRange ranges = 1;
     */
    ranges: SatRange[];
}
/**
 * @generated from protobuf message ordinals.SatRangesRequest
 */
export interface SatRangesRequest {
    /**
     * @generated from protobuf field: ordinals.OutPoint outpoint = 1;
     */
    outpoint?: OutPoint;
}
/**
 * @generated from protobuf message ordinals.SatRangesResponse
 */
export interface SatRangesResponse {
    /**
     * @generated from protobuf field: ordinals.SatRanges satranges = 1;
     */
    satranges?: SatRanges;
}
/**
 * @generated from protobuf message ordinals.SatRequest
 */
export interface SatRequest {
    /**
     * @generated from protobuf field: uint64 sat = 1;
     */
    sat: bigint;
}
/**
 * @generated from protobuf message ordinals.SatResponse
 */
export interface SatResponse {
    /**
     * @generated from protobuf field: uint64 pointer = 1;
     */
    pointer: bigint;
    /**
     * @generated from protobuf field: ordinals.SatRange satrange = 2;
     */
    satrange?: SatRange;
    /**
     * @generated from protobuf field: ordinals.OutPoint outpoint = 3;
     */
    outpoint?: OutPoint;
    /**
     * @generated from protobuf field: ordinals.SatRanges satranges = 4;
     */
    satranges?: SatRanges;
}
/**
 * @generated from protobuf message ordinals.Brc20ByAddressRequest
 */
export interface Brc20ByAddressRequest {
    /**
     * @generated from protobuf field: bytes address = 1;
     */
    address: Uint8Array;
}
/**
 * @generated from protobuf message ordinals.Brc20ByAddressResponse
 */
export interface Brc20ByAddressResponse {
    /**
     * @generated from protobuf field: repeated ordinals.OutPoint outpoints = 1;
     */
    outpoints: OutPoint[];
    /**
     * @generated from protobuf field: repeated ordinals.Brc20 brc20s = 2 [json_name = "brc20s"];
     */
    brc20S: Brc20[];
}
/**
 * @generated from protobuf message ordinals.Brc20
 */
export interface Brc20 {
    /**
     * @generated from protobuf field: bytes tick = 1;
     */
    tick: Uint8Array;
    /**
     * @generated from protobuf field: uint64 balance = 2;
     */
    balance: bigint;
}
declare class OutPoint$Type extends MessageType<OutPoint> {
    constructor();
    create(value?: PartialMessage<OutPoint>): OutPoint;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: OutPoint): OutPoint;
    internalBinaryWrite(message: OutPoint, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message ordinals.OutPoint
 */
export declare const OutPoint: OutPoint$Type;
declare class SatRange$Type extends MessageType<SatRange> {
    constructor();
    create(value?: PartialMessage<SatRange>): SatRange;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SatRange): SatRange;
    internalBinaryWrite(message: SatRange, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message ordinals.SatRange
 */
export declare const SatRange: SatRange$Type;
declare class SatRanges$Type extends MessageType<SatRanges> {
    constructor();
    create(value?: PartialMessage<SatRanges>): SatRanges;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SatRanges): SatRanges;
    internalBinaryWrite(message: SatRanges, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message ordinals.SatRanges
 */
export declare const SatRanges: SatRanges$Type;
declare class SatRangesRequest$Type extends MessageType<SatRangesRequest> {
    constructor();
    create(value?: PartialMessage<SatRangesRequest>): SatRangesRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SatRangesRequest): SatRangesRequest;
    internalBinaryWrite(message: SatRangesRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message ordinals.SatRangesRequest
 */
export declare const SatRangesRequest: SatRangesRequest$Type;
declare class SatRangesResponse$Type extends MessageType<SatRangesResponse> {
    constructor();
    create(value?: PartialMessage<SatRangesResponse>): SatRangesResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SatRangesResponse): SatRangesResponse;
    internalBinaryWrite(message: SatRangesResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message ordinals.SatRangesResponse
 */
export declare const SatRangesResponse: SatRangesResponse$Type;
declare class SatRequest$Type extends MessageType<SatRequest> {
    constructor();
    create(value?: PartialMessage<SatRequest>): SatRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SatRequest): SatRequest;
    internalBinaryWrite(message: SatRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message ordinals.SatRequest
 */
export declare const SatRequest: SatRequest$Type;
declare class SatResponse$Type extends MessageType<SatResponse> {
    constructor();
    create(value?: PartialMessage<SatResponse>): SatResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SatResponse): SatResponse;
    internalBinaryWrite(message: SatResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message ordinals.SatResponse
 */
export declare const SatResponse: SatResponse$Type;
declare class Brc20ByAddressRequest$Type extends MessageType<Brc20ByAddressRequest> {
    constructor();
    create(value?: PartialMessage<Brc20ByAddressRequest>): Brc20ByAddressRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Brc20ByAddressRequest): Brc20ByAddressRequest;
    internalBinaryWrite(message: Brc20ByAddressRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message ordinals.Brc20ByAddressRequest
 */
export declare const Brc20ByAddressRequest: Brc20ByAddressRequest$Type;
declare class Brc20ByAddressResponse$Type extends MessageType<Brc20ByAddressResponse> {
    constructor();
    create(value?: PartialMessage<Brc20ByAddressResponse>): Brc20ByAddressResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Brc20ByAddressResponse): Brc20ByAddressResponse;
    internalBinaryWrite(message: Brc20ByAddressResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message ordinals.Brc20ByAddressResponse
 */
export declare const Brc20ByAddressResponse: Brc20ByAddressResponse$Type;
declare class Brc20$Type extends MessageType<Brc20> {
    constructor();
    create(value?: PartialMessage<Brc20>): Brc20;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Brc20): Brc20;
    internalBinaryWrite(message: Brc20, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message ordinals.Brc20
 */
export declare const Brc20: Brc20$Type;
export {};
