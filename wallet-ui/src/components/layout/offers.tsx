import { OneTimeOffer } from "@daml.js/synfini-settlement-one-time-offer-interface/lib/Synfini/Interface/Settlement/OneTimeOffer/OneTimeOffer";
import OfferDetails from "./offerDetails";
import { CreateEvent } from "@daml/ledger";

export default function Offers(props: { offers?: CreateEvent<OneTimeOffer, undefined, string>[] }) {
  return (
    <>
      <div style={{ margin: "10px", padding: "10px" }}>
        {props.offers?.length === 0 && <p>You have no pending requests at this time</p>}
        {props.offers !== undefined && props.offers.length > 0 && (
          <table className="assets">
            <thead>
              <tr>
                <th style={{width: "15%"}}>ID</th>
                <th style={{width: "15%"}}>Requested by</th>
                <th style={{width: "auto"}}>Description</th>
              </tr>
            </thead>
            {props.offers.map(offer => (
              <OfferDetails offer={offer} key={offer.contractId}/>
            ))}
          </table>
        )}
      </div>
    </>
  );
}
