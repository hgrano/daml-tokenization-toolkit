import React, { useState, useEffect, useContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { userContext } from "../App";
import AuthContextStore from "../store/AuthContextStore";
import { PageLoader } from "../components/layout/page-loader";
import { WalletViewsClient } from "@synfini/wallet-views";
import { PageLayout } from "../components/PageLayout";
import Funds from "../components/layout/funds";
import { FundOffer } from "@daml.js/fund-tokenization/lib/Synfini/Fund/Offer";
import { CreateEvent } from "@daml/ledger";
import { useNavigate } from "react-router-dom";

const MainScreen: React.FC = () => {
  const nav = useNavigate();
  const walletViewsBaseUrl = `${window.location.protocol}//${window.location.host}/wallet-views`;
  const ctx = useContext(AuthContextStore);
  const ledger = userContext.useLedger();

  const { isLoading, user } = useAuth0();
  const [primaryParty, setPrimaryParty] = useState<string>("");
  const [funds, setFunds] = useState<CreateEvent<FundOffer, undefined, string>[]>();

  let walletClient: WalletViewsClient;

  walletClient = new WalletViewsClient({
    baseUrl: walletViewsBaseUrl,
    token: ctx.token,
  });

  const fetchUserLedger = async () => {
    try {
      const user = await ledger.getUser();
      const rights = await ledger.listUserRights();
      const found = rights.find(
        (right) =>
          right.type === "CanActAs" && right.party === user.primaryParty
      );
      ctx.readOnly = found === undefined;

      if (user.primaryParty !== undefined) {
        setPrimaryParty(user.primaryParty);
        ctx.setPrimaryParty(user.primaryParty);
      } else {
      }
    } catch (err) {
      console.log("error when fetching primary party", err);
    }
  };

  const fetchFunds = async () => {
    if (primaryParty !== "") {
      const resp = await ledger.query(FundOffer);
      setFunds(resp);
      
    }
  };

  useEffect(() => {
    fetchUserLedger();
  }, []);

  useEffect(() => {
    fetchFunds();
  }, [primaryParty]);


  if (isLoading) {
    return (
      <div>
        <PageLoader />
      </div>
    );
  }

  if (user?.name?.toLowerCase().includes("employee") || user?.name?.toLowerCase().includes("fund")){
    nav("/wallet");
  }

  return (
    <PageLayout>
      <div>
        {!user?.name?.toLowerCase().includes("employee") && 
        
          <Funds funds={funds} />
        }
      </div>

    </PageLayout>
  );
};

export default MainScreen;
