import { useState } from "react";
import {
	Box,
	Button,
	Container,
	Flex,
	FormControl,
	FormHelperText,
	FormLabel,
	Heading,
	Input,
	InputGroup,
	InputRightAddon,
	InputRightElement,
	Select,
	SimpleGrid,
	Slider,
	SliderFilledTrack,
	SliderMark,
	SliderThumb,
	SliderTrack,
	useToast,
	VStack,
} from "@chakra-ui/react";
import {
	DutchAuctionDescription,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb";
import { AssetId } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb";
import { Amount } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb";
import { useAuctionStore } from "./store";
import { AuctionsList } from "./AuctionsList";

const DURATION_MAP = {
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

const labelStyles = {
	mt: "2",
	ml: "-2.5",
	fontSize: "sm",
};

const ASSET_MAP = {
	eth: "Ethereum",
	tia: "Celestia",
	btc: "Bitcoin",
};

/** Blocktime of the current chain. We assume 12 seconds for simplicity */
const BLOCK_TIME_SECONDS = 12;
const BLOCKS_PER_MINUTE = 60 / BLOCK_TIME_SECONDS;

/* We assume we are at block 0 */
const CURRENT_HEIGHT = 0;

function App() {
	const { auctions, setAuctions } = useAuctionStore();

	const [assetToSell, setAssetToSell] = useState<keyof typeof ASSET_MAP | "">(
		"",
	);
	const [amountToSell, setAmountToSell] = useState(0);
	const [minPrice, setMinPrice] = useState(0);
	const [maxPrice, setMaxPrice] = useState(0);
	const [assetToReceive, setAssetToReceive] = useState<
		keyof typeof ASSET_MAP | ""
	>("");

	/** Duration of the sum of auctions in seconds, defaults to one hour */
	const [durationId, setDurationId] = useState(0);

	const totalDurationInSeconds = durationIdToActualDuration(durationId);

	const [isSubmitting, setIsSubmitting] = useState(false);

	const assetText = assetToReceive ? ASSET_MAP[assetToReceive] : "asset";
	const toast = useToast();

	/** We set an auction length such that there are always at least 1 auctions, and at most 30 auctions, to cap gas costs */
	const numberOfAuctions = mapValueToRange(
		{
			min: 0,
			max: DURATION_MAP[100],
			value: totalDurationInSeconds,
		},
		{
			min: 1,
			max: 30,
		},
	);

	return (
		<Container maxW={"4xl"} mt={30} mx={"auto"} mb={10}>
			<Heading
				fontFamily={"Faktum"}
				fontWeight={"bold"}
				as={"h1"}
				fontSize={"4xl"}
			>
				Penumbra Dutch Auctions
			</Heading>
			<SimpleGrid fontSize={"medium"} mt={10} columns={3} spacing={10}>
				<Box>
					<Heading fontSize={"2xl"}>Dutch auction</Heading>
					Penumbra auctions are a unique type of Dutch auction where the asset
					is sold over a series of sequential auctions, each auctioning off a
					portion of the total amount. This allows for a more gradual price
					discovery process and can help mitigate volatility.
				</Box>

				<Box>
					<Heading fontSize={"2xl"}>Mechanism</Heading>
					In a Penumbra auction, the seller sets a starting price and a reserve
					price. The price then decreases linearly over the duration of the
					auction, with the asset being sold to the highest bidder at the
					current price. The auction is divided into a number of sequential
					sub-auctions, each auctioning off a portion of the total amount.
				</Box>

				<Box>
					<Heading fontSize={"2xl"}>How to start?</Heading>
					In the auction house below, set the asset you want to sell, asset you
					want to receive and the parameters of the auction. Upon clicking the
					"Launch auction" button, the Dutch auction will commence.
				</Box>
			</SimpleGrid>

			<Flex
				mt={10}
				mx={"auto"}
				maxW={"xl"}
				p={8}
				rounded={"xl"}
				bg={"gray.900"}
				flexDirection={"column"}
				gap={5}
			>
				<Heading fontSize={"xl"}>Start a Penumbra Dutch Auction</Heading>
				<FormControl>
					<FormLabel>Asset to sell</FormLabel>
					<Select
						placeholder="Select token"
						onChange={(e) => {
							/*NB: we don't validate the e.target.value as the values are populated from the ASSET_MAP itself.*/
							/*TODO: switch places of assetToSell and assetToReceive if they are the same */
							setAssetToSell(e.target.value as keyof typeof ASSET_MAP);
							console.log(e.target.value);
						}}
					>
						{Object.keys(ASSET_MAP).map((key) => (
							<option key={key} value={key}>
								{ASSET_MAP[key as keyof typeof ASSET_MAP]}
							</option>
						))}
					</Select>
				</FormControl>

				<FormControl>
					<FormLabel>Amount to sell</FormLabel>
					<InputGroup>
						<Input
							value={amountToSell}
							defaultValue={"0"}
							type={"number"}
							onChange={(e) => setAmountToSell(Number(e.target.value))}
						/>
						<InputRightElement mr={2}>
							{assetToSell.toUpperCase()}
						</InputRightElement>
					</InputGroup>
				</FormControl>

				<FormControl>
					<FormLabel>Asset to receive</FormLabel>
					<Select
						placeholder="Select token"
						onChange={(e) => {
							/*NB: we don't validate the e.target.value as the values are populated from the ASSET_MAP itself.*/
							setAssetToReceive(e.target.value as keyof typeof ASSET_MAP);
							console.log(e.target.value);
						}}
					>
						{Object.keys(ASSET_MAP).map((assetKey) => (
							<option key={assetKey} value={assetKey}>
								{ASSET_MAP[assetKey as keyof typeof ASSET_MAP]}
							</option>
						))}
					</Select>
				</FormControl>

				<FormControl>
					<FormLabel>Starting price</FormLabel>
					<InputGroup>
						<Input
							value={maxPrice}
							defaultValue={"0"}
							type={"number"}
							onChange={(e) => setMaxPrice(Number(e.target.value))}
						/>
						<InputRightElement mr={2}>
							{assetToReceive.toUpperCase()}
						</InputRightElement>
					</InputGroup>
					<FormHelperText>
						Price at which your {assetText} is going to be sold
					</FormHelperText>
				</FormControl>

				<FormControl>
					<FormLabel>Reserve price</FormLabel>
					<InputGroup>
						<Input
							value={minPrice}
							defaultValue={"0"}
							type={"number"}
							onChange={(e) => setMinPrice(Number(e.target.value))}
						/>
						<InputRightElement mr={2}>
							{assetToReceive.toUpperCase()}
						</InputRightElement>
					</InputGroup>
					<FormHelperText>
						The lowest price at which your {assetText} is going to be sold
					</FormHelperText>
				</FormControl>

				<FormControl pb={10}>
					<FormLabel>Auction duration</FormLabel>
					<Slider
						step={12.5}
						aria-label="slider-ex"
						onChange={(val) => setDurationId(val)}
					>
						<SliderMark value={0} {...labelStyles}>
							10 min
						</SliderMark>
						<SliderMark value={12.5} {...labelStyles}>
							30 min
						</SliderMark>
						<SliderMark value={25} {...labelStyles}>
							1 hr
						</SliderMark>
						<SliderMark value={37.5} {...labelStyles}>
							2 hr
						</SliderMark>
						<SliderMark value={50} {...labelStyles}>
							6 hr
						</SliderMark>
						<SliderMark value={62.5} {...labelStyles}>
							12 hr
						</SliderMark>
						<SliderMark value={75} {...labelStyles}>
							24 hr
						</SliderMark>
						<SliderMark value={87.5} {...labelStyles}>
							48 hr
						</SliderMark>
						<SliderMark w={"40"} value={100} {...labelStyles}>
							96 hr
						</SliderMark>

						<SliderTrack>
							<SliderFilledTrack />
						</SliderTrack>
						<SliderThumb />
					</Slider>
				</FormControl>

				<FormControl>
					<Button
						isLoading={isSubmitting}
						loadingText={"Starting auction..."}
						w={"full"}
						colorScheme={"blue"}
						onClick={() => {
							console.log("starting auction");
							setIsSubmitting(true);

							/*Start 5 minutes from now to give time to cancel*/
							const startingHeight = CURRENT_HEIGHT + BLOCKS_PER_MINUTE * 5;

							/* We want to create N sequential auctions, overlapping minimally with a random inteval < 1 minute */
							const auctions = Array(numberOfAuctions).fill(undefined).map((_, index) => {
								/* How many blocks should the auctions overlap*/
								const overlapBlocks = Math.floor(
									Math.random() * BLOCKS_PER_MINUTE,
								);

								const auctionDurationSeconds = Math.floor(
									totalDurationInSeconds / numberOfAuctions,
								);

								/* Create a new auction */
								const auction = auctionToDutchAuctionDescription({
									amountToSell: amountToSell / numberOfAuctions,
									startingHeight,
									assetToReceive,
									assetToSell,
									auctionDurationSeconds,
									index,
									maxPrice,
									minPrice,
									overlapBlocks,
								});

								return auction;
							});

							setTimeout(() => {
								/*Insert auctions into storage */
								console.log(auctions);

								setAuctions([
									{
										total: amountToSell,
										data: auctions,
										duration_secs: totalDurationInSeconds,
									},
								]);

								setIsSubmitting(false);
								toast({
									title: "Auction created",
									description: "We've queded an auction to start in 5 minutes",
									status: "success",
									duration: 3_000,
									isClosable: true,
								});
							}, 2_000);
						}}
					>
						Create auction
					</Button>
				</FormControl>
			</Flex>
			<AuctionsList auctions={auctions.map(a => JSON.parse(a))} />
		</Container>
	);
}

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

function auctionToDutchAuctionDescription({
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
		maxOutput: numberToAmount(amountToSell / maxPrice),
		minOutput: numberToAmount(amountToSell / minPrice),
		outputId: new AssetId({
			altBaseDenom: assetToReceive,
		}),
		nonce: getRandomNonce(),
	});
}

function numberToAmount(value: number): Amount {
	// TODO: bigints are arbitrarily sized, so we should test if amountToSell fits into 128 bits, and split at 64 bits.
	return new Amount({
		lo: BigInt(Math.floor(value)),
	});
}

/** Gets a random 10-byte array to be used as a nonce */
function getRandomNonce() {
	const randomArray = new Uint8Array(10);
	crypto.getRandomValues(randomArray);
	return randomArray;
}

/** Since the slider to select duration is non-linear, we treat the value as an id,
 * and convert to actual seconds in this function
 * @returns duration in seconds
 * */
function durationIdToActualDuration(durationid: number) {
	if (!(durationid in DURATION_MAP)) {
		console.warn(
			"Duration Id not found in duration map, defaulting to 10 minutes",
		);
		return DURATION_MAP[0];
	}

	return DURATION_MAP[durationid as keyof typeof DURATION_MAP];
}

type Range = {
	min: number;
	max: number;
};

type InputRange = Range & {
	value: number;
};

/** Linearly maps a value from one range to another */
function mapValueToRange(input: InputRange, output: Range): number {
	const { value, min: inputMin, max: inputMax } = input;
	const { min: outputMin, max: outputMax } = output;

	// Calculate the ratio of the value within the input range
	const ratio = (value - inputMin) / (inputMax - inputMin);

	// Map the ratio to the output range and round to the nearest integer
	const mappedValue = Math.round(outputMin + ratio * (outputMax - outputMin));

	return mappedValue;
}

export default App;
