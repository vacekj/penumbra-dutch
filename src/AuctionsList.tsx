import {
	Box,
	Button,
	Heading,
	HStack,
	Link,
	Progress,
	Tag,
	VStack,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { type Auction, useAuctionStore } from "./store";

import { blockToTimestamp } from "./utils";

export function AuctionsList(props: { auctions: Auction[] }) {
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
				{props.auctions.length > 0 ? (
					<>
						<Heading mb={-5} alignSelf={"start"}>
							My auctions
						</Heading>
						{props.auctions.map((auction) => (
							<AuctionCard key={JSON.stringify(auction)} auction={auction} />
						))}
					</>
				) : (
					<></>
				)}
			</VStack>
		</>
	);
}

type AuctionStatus = "queued" | "active" | "ended";

function AuctionCard({
	auction,
}: {
	auction: Auction;
}) {
	const startDate = new Date(blockToTimestamp(auction.startBlock) * 1000);
	const endDate = new Date(
		(blockToTimestamp(auction.startBlock) + auction.durationSecs) * 1000,
	);
	const status: AuctionStatus =
		new Date() > endDate
			? "ended"
			: new Date() > startDate
				? "active"
				: "queued";

	const { setAuctions, auctions } = useAuctionStore();
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
				<Heading fontSize={"2xl"}>
					{auction.total}{" "}
					{auction.data[0]?.input?.assetId?.altBaseDenom.toUpperCase()}
				</Heading>
				<Heading fontSize={"lg"}>→</Heading>
				<Heading fontSize={"2xl"}>
					{(auction.total * auction.startPrice).toFixed(2)} -{" "}
					{(auction.total * auction.endPrice).toFixed(2)}{" "}
					{auction.data[0]?.outputId?.altBaseDenom.toUpperCase()}
				</Heading>
			</HStack>
			<HStack alignItems={"center"} justifyContent={"space-between"}>
				<Box>5 TIA / ETH</Box>
				<Box>3 TIA / ETH</Box>
			</HStack>
			<Progress value={calculateProgress(startDate, endDate)} />
			<HStack alignItems={"center"} justifyContent={"space-between"}>
				<Box>{startDate.toLocaleString()}</Box>
				<Box>{endDate.toLocaleString()}</Box>
			</HStack>
			<HStack mt={3} alignItems={"center"} justifyContent={"space-between"}>
				<Box display={"flex"} alignItems={"center"} gap={3}>
					Status: <StatusTag status={status} />
				</Box>
				{status !== "ended" && (
					<Button
						colorScheme={"red"}
						onClick={() => {
							setAuctions(
								auctions
									.map((auction) => JSON.parse(auction))
									.filter((currentAuction: Auction) => {
										// return false;
										return currentAuction.id !== auction.id;
									}),
							);
						}}
					>
						Cancel
					</Button>
				)}
			</HStack>
			<HStack mt={3} alignItems={"center"} justifyContent={"space-between"}>
				<Box fontSize={"small"} color={"gray.500"}>
					Auction ID: {auction.id}
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

function StatusTag({ status }: { status: AuctionStatus }) {
	return (() => {
		switch (status) {
			case "queued":
				return <Tag size={"lg"}>Queued</Tag>;
			case "active":
				return <Tag size={"lg"}>Active</Tag>;
			case "ended":
				return <Tag size={"lg"}>Ended</Tag>;
		}
	})();
}

function calculateProgress(startDate: Date, endDate: Date): number {
	const currentTime = new Date().getTime();
	const startTime = startDate.getTime();
	const endTime = endDate.getTime();

	// Ensure the current time is within the range
	if (currentTime <= startTime) {
		return 0;
	} else if (currentTime >= endTime) {
		return 100;
	}

	// Calculate the progress
	const progress = ((currentTime - startTime) / (endTime - startTime)) * 100;

	return Math.round(progress);
}
