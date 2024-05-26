import {Amount} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb";
import {
	DutchAuctionDescription
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb";
import {AssetId} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb";

export const DURATION_MAP = {
	0: 10 * 60,
	12.5: 30 * 60,
	25: 60 * 60,
	37.5: 2 * 60 * 60,
	50: 6 * 60 * 60,
	62.5: 12 * 60 * 60,
	75: 24 * 60 * 60,
	87.5: 48 * 60 * 60,
	100: 96 * 60 * 60,
};

export const ASSET_MAP = {
	eth: "Ethereum",
	tia: "Celestia",
	btc: "Bitcoin",
};

/** Blocktime of the current chain. We assume 12 seconds for simplicity */
export const BLOCK_TIME_SECONDS = 12;
export const BLOCKS_PER_MINUTE = 60 / BLOCK_TIME_SECONDS;

/* We assume we are at block 0 */
export const CURRENT_HEIGHT = 0;

export function numberToAmount(value: number): Amount {
	// TODO: bigints are arbitrarily sized, so we should test if amountToSell fits into 128 bits, and split at 64 bits.
	return new Amount({
		lo: BigInt(Math.floor(value)),
	});
}

/** Gets a random 10-byte array to be used as a nonce */
export function getRandomNonce() {
	const randomArray = new Uint8Array(10);
	crypto.getRandomValues(randomArray);
	return randomArray;
}

/** Since the slider to select duration is non-linear, we treat the value as an id,
 * and convert to actual seconds in this function
 * @returns duration in seconds
 * */
export function durationIdToActualDuration(durationid: number) {
	if (!(durationid in DURATION_MAP)) {
		console.warn(
			"Duration Id not found in duration map, defaulting to 10 minutes",
		);
		return DURATION_MAP[0];
	}

	return DURATION_MAP[durationid as keyof typeof DURATION_MAP];
}

/** Linearly maps a value from one range to another */
export function mapValueToRange(input: InputRange, output: Range): number {
	const { value, min: inputMin, max: inputMax } = input;
	const { min: outputMin, max: outputMax } = output;

	// Calculate the ratio of the value within the input range
	const ratio = (value - inputMin) / (inputMax - inputMin);

	// Map the ratio to the output range and round to the nearest integer
	const mappedValue = Math.round(outputMin + ratio * (outputMax - outputMin));

	return mappedValue;
}

export function blockToTimestamp(blockNumber: number) {
	/** Assume the chain started today */
	return Date.now() / 1000 + BLOCK_TIME_SECONDS * blockNumber;
}

export type Range = {
	min: number;
	max: number;
};

export type InputRange = Range & {
	value: number;
};
export type AuctionData = {
	startingHeight: number;
	index: number;
	auctionDurationSeconds: number;
	amountToSell: number;
	assetToSell: string;
	overlapBlocks: number;
	maxPrice: number;
	minPrice: number;
	assetToReceive: string;
};

export function auctionToDutchAuctionDescription({
																									 startingHeight,
																									 index,
																									 auctionDurationSeconds,
																									 amountToSell,
																									 assetToSell,
																									 overlapBlocks,
																									 maxPrice,
																									 minPrice,
																									 assetToReceive,
																								 }: AuctionData): DutchAuctionDescription {
	return new DutchAuctionDescription({
		startHeight: BigInt(startingHeight),
		endHeight: BigInt(
			(index + 1) * Math.ceil(auctionDurationSeconds / BLOCK_TIME_SECONDS) +
			overlapBlocks,
		),
		input: {
			amount: numberToAmount(amountToSell),
			assetId: new AssetId({
				altBaseDenom: assetToSell,
			}),
		},
		maxOutput: numberToAmount(amountToSell * maxPrice),
		minOutput: numberToAmount(amountToSell * minPrice),
		outputId: new AssetId({
			altBaseDenom: assetToReceive,
		}),
		nonce: getRandomNonce(),
	});
}
