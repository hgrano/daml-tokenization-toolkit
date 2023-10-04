import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { userContext } from "../App";
import AuthContextStore from "../store/AuthContextStore";
import { WalletViewsClient } from "@synfini/wallet-views";
import Balances from "../components/layout/balances";
import { PageLayout } from "../components/PageLayout";
import {AccountDetailsSimple} from "../components/layout/accountDetails";
import { PageLoader } from "../components/layout/page-loader";
import { Balance, InstrumentSummary } from "@daml.js/synfini-wallet-views-types/lib/Synfini/Wallet/Api/Types";

const AccountBalanceScreen: React.FC = () => {
  const { isLoading } = useAuth0();
  const { state } = useLocation();
  const ledger = userContext.useLedger();
  const ctx = useContext(AuthContextStore);
  const walletViewsBaseUrl: string = `${window.location.protocol}//${window.location.host}/wallet-views`;

  const [balances, setBalances] = useState<Balance[]>();
  const [instruments, setInstruments] = useState<InstrumentSummary[]>();
  const [primaryParty, setPrimaryParty] = useState<string>('');

  let walletClient: WalletViewsClient;
  walletClient = new WalletViewsClient({
    baseUrl: walletViewsBaseUrl,
    token: ctx.token,
  });

  const fetchUserLedger = async () => {
      try {
        const user = await ledger.getUser();
        if (user.primaryParty !== undefined) {
          setPrimaryParty(user.primaryParty);
          ctx.setPrimaryParty(user.primaryParty);
        }
      } catch (err) {
        console.log("error when fetching primary party", err);
      }
  };

  const fetchBalances = async () => {
    if (primaryParty !== "") {

      const resp = await walletClient.getBalance({
        account: {
          owner: primaryParty,
          custodian: state.account.view.custodian,
          id: { unpack: state.account.view.id.unpack },
        },
      });
      setBalances(resp.balances);
      return resp;
    }
    return null;
  };

  useEffect(() => {
    fetchUserLedger();
  }, []);

  useEffect(() => {
    fetchBalances().then(res => {
      if (res!==null){

        res.balances.forEach(balance => {
          const resp_instrument = walletClient.getInstruments({
            depository: balance.instrument.depository,
            issuer: balance.instrument.issuer,
            id: { unpack: balance.instrument.id.unpack },
            version: balance.instrument.version
          });

          resp_instrument.then(resp_instrument => {
            setInstruments(resp_instrument.instruments);
          })
        })
      }
    });
  }, [primaryParty]);

  if (isLoading) {
    return (
      <div>
        <PageLoader />
      </div>
    );
  }

  return (
    <PageLayout>
      <h3 className="profile__title" style={{marginTop: '10px'}}>Account Balance</h3>
      <AccountDetailsSimple account={state.account}></AccountDetailsSimple>
      <Balances balances={balances} instruments={instruments}></Balances>
    </PageLayout>
  );
};

export default AccountBalanceScreen;
