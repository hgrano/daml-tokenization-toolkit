import React, { useState, useEffect, useContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { userContext } from "../App";
import AuthContextStore from "../store/AuthContextStore";
import { PageLoader } from "../components/layout/page-loader";
import { WalletViewsClient } from "@synfini/wallet-views";
import { PageLayout } from "../components/PageLayout";
import Settlements from "../components/layout/settlements";
import { SettlementSummary } from "@daml.js/synfini-wallet-views-types/lib/Synfini/Wallet/Api/Types";
import { fetchDataForUserLedger } from "../components/UserLedgerFetcher";
import { useLocation } from "react-router-dom";

const SettlementScreen: React.FC = () => {
  //const walletViewsBaseUrl = `${window.location.protocol}//${window.location.host}`;
  const walletViewsBaseUrl = process.env.REACT_APP_API_SERVER_URL || "";
  const { state } = useLocation();
  const ctx = useContext(AuthContextStore);
  const ledger = userContext.useLedger();

  const { isLoading } = useAuth0();
  const [settlements, setSettlements] = useState<SettlementSummary[]>();
  const [filter, setFilter] = useState<string>("");

  let walletClient: WalletViewsClient;

  walletClient = new WalletViewsClient({
    baseUrl: walletViewsBaseUrl,
    token: ctx.token,
  });

  const fetchSettlements = async () => {
    if (ctx.primaryParty !== "") {
      const resp = await walletClient.getSettlements({ before: null, limit: null });
      setSettlements(resp.settlements);
    }
  };

  useEffect(() => {
    fetchDataForUserLedger(ctx, ledger);
  }, [ctx, ledger]);

  useEffect(() => {
    fetchSettlements();
  }, [ctx.primaryParty]);

  if (isLoading) {
    return (
      <div>
        <PageLoader />
      </div>
    );
  }

  let settlementsFiltered = settlements;

  if (state !== null && state.transactionId !== null) {
    const settlement = settlements?.find((settlement) => settlement.batchId.unpack === state.transactionId);
    settlementsFiltered = settlement ? [settlement] : [];
  }

  if (filter!== "" && settlementsFiltered!== undefined){
    console.log("filter",filter)

    if (filter==="pending")
      settlementsFiltered = settlementsFiltered.filter(settlement => settlement.execution === null);
      if (filter==="settled")
      settlementsFiltered = settlementsFiltered.filter(settlement => settlement.execution !== null);
  }

  console.log("settlements", settlementsFiltered);

  return (
    <PageLayout>
      <div>
        <div style={{ marginTop: "15px" }}>
          <h4 className="profile__title">Transactions</h4>
        </div>
        <div>
        <div style={{ marginLeft: "200px",display: "flex", justifyContent: "left"  }} >
          <button type="button" className="button__sign-up" style={{width: "100px"}} onClick={() => setFilter("pending")}>
            Pending
          </button>
          <button type="button" className="button__sign-up" style={{width: "100px"}} onClick={() => setFilter("settled")}>
            Settled
          </button>
        </div>
      </div>
        <Settlements settlements={settlementsFiltered} />
      </div>
    </PageLayout>
  );
};

export default SettlementScreen;
