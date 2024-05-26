import { create } from "zustand";
import type { DutchAuctionDescription } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb";
import { persist } from "zustand/middleware";

export type Auction = {
	id: string;
	data: DutchAuctionDescription[];
	/** Total amount to sell */
	total: number;
	/** Duration in seconds */
	durationSecs: number;
	startBlock: number;
	startPrice: number;
	endPrice: number;
};

interface AuctionStore {
	auctions: string[];
	setAuctions: (auctions: Auction[]) => void;
}

export const useAuctionStore = create<AuctionStore>()(
	persist(
		(set) => ({
			setAuctions: (auctions: Auction[]) =>
				set((state) => ({
					...state,
					auctions: auctions.map((a) => JSON.stringify(a)),
				})),
			auctions: [],
		}),
		{
			name: "auctions-storage",
		},
	),
);
