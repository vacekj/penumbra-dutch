import {useState} from "react";
import {
	Box,
	Button,
	Container,
	Flex,
	FormControl,
	FormErrorMessage,
	FormHelperText,
	FormLabel,
	Heading,
	Input,
	InputGroup,
	InputRightElement,
	Select,
	SimpleGrid,
	Slider,
	SliderFilledTrack,
	SliderMark,
	SliderThumb,
	SliderTrack,
	useToast,
} from "@chakra-ui/react";
import {useAuctionStore} from "./store";
import {AuctionsList} from "./AuctionsList";
import {
	ASSET_MAP, auctionToDutchAuctionDescription,
	BLOCKS_PER_MINUTE,
	CURRENT_HEIGHT,
	DURATION_MAP,
	durationIdToActualDuration,
	getRandomNonce,
	mapValueToRange
} from "./utils";

const labelStyles = {
	mt: "2",
	ml: "-2.5",
	fontSize: "sm",
};

function App() {
	const { auctions: serializedAuctions, setAuctions } = useAuctionStore();

	const [assetToSell, setAssetToSell] = useState<keyof typeof ASSET_MAP | "">(
		"",
	);
	const [amountToSell, setAmountToSell] = useState(0);
	const [priceError, setPriceError] = useState(false);
	const [maxPrice, setMaxPrice] = useState(0);
	const [minPrice, setMinPrice] = useState(0);
	const [assetToReceive, setAssetToReceive] = useState<
		keyof typeof ASSET_MAP | ""
	>("");

	/** Duration of the sum of auctions in seconds, defaults to one hour */
	const [durationId, setDurationId] = useState(0);

	const totalDurationInSeconds = durationIdToActualDuration(durationId);

	const [isSubmitting, setIsSubmitting] = useState(false);

	const assetText = assetToSell ? ASSET_MAP[assetToSell] : "asset";
	const toast = useToast();

	/** We set an auction length such that there are always at least 1 sub-auctions, and at most 30 sub-auctions, to cap gas costs */
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
			<SimpleGrid fontSize={"medium"} mt={10} columns={[1, 3]} spacing={10}>
				<Box>
					<Heading fontSize={"2xl"}>Dutch auctions</Heading>
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
					current price.
				</Box>

				<Box>
					<Heading fontSize={"2xl"}>How to start?</Heading>
					In the auction box below, set the asset you want to sell, asset you
					want to receive and the parameters of the auction. Upon clicking the
					"Create auction" button, your auction will be queued to start in 5 minutes.
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
							setAssetToSell(e.target.value as keyof typeof ASSET_MAP);
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
							value={amountToSell !== 0 ? amountToSell : ""}
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
						}}
					>
						{Object.keys(ASSET_MAP).map((assetKey) => (
							<option key={assetKey} value={assetKey}>
								{ASSET_MAP[assetKey as keyof typeof ASSET_MAP]}
							</option>
						))}
					</Select>
				</FormControl>

				<FormControl isInvalid={priceError}>
					<FormLabel>Starting price</FormLabel>
					<InputGroup>
						<Input
							value={maxPrice !== 0 ? maxPrice : ""}
							type={"number"}
							onChange={(e) => setMaxPrice(Number(e.target.value))}
						/>
						<InputRightElement mr={2}>
							{assetToReceive.toUpperCase()}
						</InputRightElement>
					</InputGroup>
					<FormHelperText>
						Price at which your {assetText} is going to start selling
					</FormHelperText>
				</FormControl>

				<FormControl isInvalid={priceError}>
					<FormLabel>Reserve price</FormLabel>
					<InputGroup>
						<Input
							value={minPrice !== 0 ? minPrice : ""}
							type={"number"}
							onChange={(e) => setMinPrice(Number(e.target.value))}
						/>
						<InputRightElement mr={2}>
							{assetToReceive.toUpperCase()}
						</InputRightElement>
					</InputGroup>
					{!priceError ? (
						<FormHelperText>
							The lowest price at which your {assetText} is going to be sold
						</FormHelperText>
					) : (
						<FormErrorMessage>
							Reserve price cannot be higher than Starting price
						</FormErrorMessage>
					)}
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
							if (
								minPrice === 0 ||
								maxPrice === 0 ||
								amountToSell === 0 ||
								assetToSell === "" ||
								assetToReceive === ""
							) {
								return;
							}

							/*Check that starting price >= reserve price*/
							if (minPrice > maxPrice) {
								setPriceError(true);
								return;
							}

							setPriceError(false);
							setIsSubmitting(true);

							/*Start 5 minutes from now to give time to cancel*/
							const startingHeight = CURRENT_HEIGHT + BLOCKS_PER_MINUTE * 5;

							/* We want to create N sequential auctions, overlapping minimally with a random inteval < 1 minute */
							const auctions = Array(numberOfAuctions)
								.fill(undefined)
								.map((_, index) => {
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
								setAuctions([
									...serializedAuctions.map((a) => JSON.parse(a)),
									{
										id: getRandomNonce().toString(),
										total: amountToSell,
										data: auctions,
										durationSecs: totalDurationInSeconds,
										startBlock: startingHeight,
										startPrice: maxPrice,
										endPrice: minPrice,
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
			<AuctionsList auctions={serializedAuctions.map((a) => JSON.parse(a))} />
		</Container>
	);
}


export default App;
