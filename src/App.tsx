import { useState } from "react";
import {
	Box,
	Container,
	Flex,
	FormControl,
	FormHelperText,
	FormLabel,
	Heading,
	Input, InputGroup, InputRightAddon, InputRightElement,
	Select,
	SimpleGrid,
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

	const assetText = assetToReceive ? ASSET_MAP[assetToReceive] : "asset";

	return (
		<Container maxW={"4xl"} mt={30} mx={"auto"}>
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
				p={6}
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
							setAssetToReceive(e.target.value as keyof typeof ASSET_MAP);
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
					<Input defaultValue={"0"} type={"number"} />
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
						{Object.keys(ASSET_MAP).map((key) => (
							<option key={key} value={key}>
								{ASSET_MAP[key as keyof typeof ASSET_MAP]}
							</option>
						))}
					</Select>
				</FormControl>

				<FormControl>
					<FormLabel>Starting price</FormLabel>
					<InputGroup>
						<Input defaultValue={"0"} type={"number"} />
						<InputRightElement>{assetToReceive.toUpperCase()}</InputRightElement>
					</InputGroup>
					<FormHelperText>
						Price at which your {assetText} is going to be sold
					</FormHelperText>
				</FormControl>

				<FormControl>
					<FormLabel>Reserve price</FormLabel>
					<InputGroup>
						<Input defaultValue={"0"} type={"number"} />
						<InputRightElement>{assetToReceive.toUpperCase()}</InputRightElement>
					</InputGroup>
					<FormHelperText>
						The lowest price at which your {assetText} is going to be sold
					</FormHelperText>
				</FormControl>
			</Flex>
		</Container>
	);
}

export default App;
