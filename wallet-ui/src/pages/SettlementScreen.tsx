import React, { useState, useEffect, useContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { userContext } from "../App";
import AuthContextStore from "../store/AuthContextStore";
import { PageLoader } from "../components/layout/page-loader";
import { WalletViewsClient } from "@synfini/wallet-views";
import { PageLayout } from "../components/PageLayout";
import Settlements from "../components/layout/settlements";

const SettlementScreen: React.FC = () => {
  const walletViewsBaseUrl = `${window.location.protocol}//${window.location.host}/wallet-views`;
  const ctx = useContext(AuthContextStore);
  const ledger = userContext.useLedger();

  const { isAuthenticated, isLoading } = useAuth0();
  const [primaryParty, setPrimaryParty] = useState<string>();
  const [settlements, setSettlements] = useState<any[]>();

  let walletClient: WalletViewsClient;

  walletClient = new WalletViewsClient({
    baseUrl: walletViewsBaseUrl,
    token: ctx.token,
  });

  const fetchUserLedger = async () => {
    if (isAuthenticated && !isLoading) {
      try {
        const user = await ledger.getUser();
        if (user.primaryParty !== undefined) {
          setPrimaryParty(user.primaryParty);
          ctx.setPrimaryParty(user.primaryParty);
        } else {
        }
      } catch (err) {
        console.log("error when fetching primary party", err);
      }
    }
  };

  const fetchSettlements = async () => {
    if (primaryParty !== "") {
      const resp = await walletClient.getSettlements({ before: null, limit:null });
      setSettlements(resp.settlements);
    }
  };

  useEffect(() => {
    fetchUserLedger();
  }, []);

  useEffect(() => {
    fetchSettlements();
  }, [primaryParty]);

  if (isLoading) {
    return (
      <div>
        <PageLoader />
      </div>
    );
  }

  console.log("setllem", settlements);

  return (
    <PageLayout>
      <div>
            <Settlements settlements={settlements} />
      </div>
    </PageLayout>
  );
};

export default SettlementScreen;