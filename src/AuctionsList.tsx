import type { DutchAuctionDescription } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb";
import { Box, VStack } from "@chakra-ui/react";

export function AuctionsList(props: { auctions: DutchAuctionDescription[] }) {
	console.log(props.auctions);
	return <div>ll</div>
	return (
		<VStack>
			{props.auctions.map((auction) => {
				return (
					<VStack key={auction.nonce.toString()}>
						<Box>{auction.nonce}</Box>
					</VStack>
				);
			})}
		</VStack>
	);
}
