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
	SliderTrack, useToast,
	VStack,
} from "@chakra-ui/react";

const ASSET_MAP = {
	eth: "Ethereum",
	tia: "Celestia",
	btc: "Bitcoin",
};

function App() {
	const [assetToSell, setAssetToSell] = useState<keyof typeof ASSET_MAP | "">(
		"",
	);
	const [assetToReceive, setAssetToReceive] = useState<
		keyof typeof ASSET_MAP | ""
	>("");

	/** Duration of the sum of auctions in seconds, defaults to one hour */
	const [durationSeconds, setDurationSeconds] = useState(60 * 60);

	const labelStyles = {
		mt: "2",
		ml: "-2.5",
		fontSize: "sm",
	};

	const [isSubmitting, setIsSubmitting] = useState(false);

	const assetText = assetToReceive ? ASSET_MAP[assetToReceive] : "asset";
	const toast = useToast();
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
						<Input defaultValue={"0"} type={"number"} />
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
						<Input defaultValue={"0"} type={"number"} />
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
						<Input defaultValue={"0"} type={"number"} />
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
						onChange={(val) => setDurationSeconds(val)}
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
							setTimeout(() => {
								setIsSubmitting(false);
								toast({
									title: "Auction created",
									description: "We've queded an auction to start in 5 minutes",
									status: "success",
									duration: 3_000,
									isClosable: true,
								})
							}, 2_000);
						}}
					>
						Create auction
					</Button>
				</FormControl>
			</Flex>
		</Container>
	);
}

export default App;
