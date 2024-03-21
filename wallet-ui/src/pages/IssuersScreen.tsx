import React, { useContext, useEffect, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import AuthContextStore from "../store/AuthContextStore";
import { userContext } from "../App";
import { WalletViewsClient } from "@synfini/wallet-views";
import { fetchDataForUserLedger } from "../components/UserLedgerFetcher";
import { PageLoader } from "../components/layout/page-loader";
import Issuers from "../components/layout/issuers";
import { InstrumentSummary, IssuerSummary } from "@daml.js/synfini-wallet-views-types/lib/Synfini/Wallet/Api/Types";
import InstrumentsToken from "../components/layout/instrumentsToken";

const IssuersScreen: React.FC = () => {
  const walletViewsBaseUrl = process.env.REACT_APP_API_SERVER_URL || "";
  const ctx = useContext(AuthContextStore);
  const ledger = userContext.useLedger();
  const wallet_depository = process.env.REACT_APP_PARTIES_ENVIRONMENTAL_TOKEN_DEPOSITORY || "";

  const [isLoading] = useState<boolean>(false);
  const [issuers, setIssuers] = useState<IssuerSummary[]>();
  const [instruments, setInstruments] = useState<InstrumentSummary[]>();

  let walletClient: WalletViewsClient;

  walletClient = new WalletViewsClient({
    baseUrl: walletViewsBaseUrl,
    token: ctx.token,
  });
  const fetchIssuers = async () => {
    if (ctx.primaryParty !== "") {
      const resp = await walletClient.getIssuers({
        depository: wallet_depository,
        issuer: ctx.primaryParty,
      });
      setIssuers(resp.issuers);
    }
  };

  const fetchInstruments = async () => {

    const resp_instrument = await walletClient.getInstruments({
         depository: wallet_depository, 
         issuer: ctx.primaryParty, 
         id: null, 
         version: null
    });
    setInstruments(resp_instrument.instruments);
  }

  useEffect(() => {
    fetchDataForUserLedger(ctx, ledger);
  }, [ctx, ledger]);

  useEffect(() => {
    fetchIssuers();
    fetchInstruments();
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageLoader />
      </div>
    );
  }

  return (
    <PageLayout>
      <>
        <div style={{ marginTop: "15px" }}>
          <h4 className="profile__title">Issuance</h4>
        </div>
        <Issuers issuers={issuers} />
        <InstrumentsToken instruments={instruments} />
      </>
    </PageLayout>
  );
};

export default IssuersScreen;
