import type { DutchAuctionDescription } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb";
import {
	Box,
	Heading,
	HStack,
	Icon,
	Link,
	Progress,
	VStack,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
// biome-ignore lint/style/useImportType: <explanation>
import { Auction } from "./store";
import { blockToTime } from "./App";

export function AuctionsList(props: { auctions: Auction[] }) {
	console.log(props.auctions);
	return (
		<>
			<VStack
				my={116}
				mx={"auto"}
				justifyContent={"center"}
				alignItems={"center"}
				gap={5}
				maxW={"2xl"}
			>
				<Heading mb={-5} alignSelf={'start'}>Your auctions</Heading>
				{props.auctions.map((auction, i) => (
					<AuctionCard key={JSON.stringify(auction)} auction={auction} />
				))}
			</VStack>
		</>
	);
}

function AuctionCard({
	auction,
}: {
	auction: Auction;
}) {
	console.log("auct", auction);
	console.log(blockToTime(auction.startBlock));
	const startDate = new Date(blockToTime(auction.startBlock) * 1000);
	const endDate = new Date(
		(blockToTime(auction.startBlock) + auction.duration_secs) * 1000,
	);
	return (
		<VStack
			alignItems={"stretch"}
			p={7}
			bg={"gray.900"}
			my={5}
			w={"full"}
			rounded={"lg"}
		>
			<HStack alignItems={"center"} justifyContent={"space-between"} mb={3}>
				<Heading fontSize={"2xl"}>100 ETH</Heading>
				<Heading fontSize={"lg"}>→</Heading>
				<Heading fontSize={"2xl"}>300 - 500 TIA</Heading>
			</HStack>
			<HStack alignItems={"center"} justifyContent={"space-between"}>
				<Box>5 TIA / ETH</Box>
				<Box>3 TIA / ETH</Box>
			</HStack>
			<Progress value={80} />
			<HStack alignItems={"center"} justifyContent={"space-between"}>
				<Box>{startDate.toLocaleString()}</Box>
				<Box>{endDate.toLocaleString()}</Box>
			</HStack>
			<HStack mt={3} alignItems={"center"} justifyContent={"space-between"}>
				<Box fontSize={"small"} color={"gray.500"}>
					Auction ID: 098021n3kl123==
				</Box>
				<Link
					display={"flex"}
					alignItems={"center"}
					gap={1}
					fontSize={"small"}
					color={"gray.500"}
					href={"#"}
				>
					See on Penumbrascan <ExternalLinkIcon />
				</Link>
			</HStack>
		</VStack>
	);
}
