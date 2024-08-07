// Copyright (c) 2024 ASX Operations Pty Ltd. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CreateEvent } from "@daml/ledger";
import OfferDetails from "./offerDetails";
import { OpenOffer as SettlementOpenOffer } from "@daml.js/synfini-settlement-open-offer-interface/lib/Synfini/Interface/Settlement/OpenOffer/OpenOffer";

export default function Offers(props: { offers?: CreateEvent<SettlementOpenOffer, undefined, string>[] }) {
  return (
    <>
      <div style={{ margin: "10px", padding: "10px" }}>
        {
          props.offers !== undefined &&
          props.offers.map(offer => <OfferDetails offer={offer} key={offer.contractId}></OfferDetails>)
        }
      </div>
    </>
  );
}
