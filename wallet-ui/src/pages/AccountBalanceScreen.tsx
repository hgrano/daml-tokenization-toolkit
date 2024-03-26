import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Balances from "../components/layout/balances";
import { PageLayout } from "../components/PageLayout";
import { AccountDetailsSimple } from "../components/layout/accountDetails";
import { PageLoader } from "../components/layout/page-loader";
import {
  AccountSummary,
  Balance,
  InstrumentSummary,
} from "@daml.js/synfini-wallet-views-types/lib/Synfini/Wallet/Api/Types";
import BalanceSbts from "../components/layout/balanceSbts";
import { useWalletUser, useWalletViews } from "../hooks/WalletViews";

const AccountBalanceScreen: React.FC = () => {
  const { isLoading } = useAuth0();
  const { state } = useLocation() as { state: { account: AccountSummary }};
  const walletClient = useWalletViews();
  const { primaryParty } = useWalletUser();

  const [balances, setBalances] = useState<Balance[]>([]);
  const [instruments, setInstruments] = useState<(InstrumentSummary | undefined)[]>();

  const fetchBalances = async () => {
    if (primaryParty !== undefined) {
      const resp = await walletClient.getBalance({
        account: {
          owner: primaryParty,
          custodian: state.account.view.custodian,
          id: state.account.view.id,
        },
      });
      setBalances(resp.balances);
      return resp.balances;
    }
    return [];
  };

  const fetchInstruments = async (balancesIns: Balance[]) => {
    return await Promise.all(
      balancesIns.map(async (balance) => {
        const instruments = await walletClient.getInstruments(balance.instrument);
        if (instruments.instruments.length > 0) {
          return instruments.instruments[0];
        } else {
          return undefined;
        }
      })
    );
  }

  useEffect(() => {
    fetchBalances()
  },[primaryParty]);

  useEffect(() => {
    fetchInstruments(balances)
    .then((res => setInstruments(res)));
  },[primaryParty])

  if (isLoading) {
    return (
      <div>
        <PageLoader />
      </div>
    );
  }

  return (
    <PageLayout>
      <h3 className="profile__title" style={{ marginTop: "10px" }}>
        Account Balance
      </h3>
      <AccountDetailsSimple account={state.account}></AccountDetailsSimple>
      {state.account.view.id.unpack !== "sbt" ? (
        <Balances balances={balances}></Balances>
        ) : (
        <BalanceSbts instruments={instruments?.flatMap(i => i === undefined ? [] : [i])} />
      )}
    </PageLayout>
  );
};

export default AccountBalanceScreen;
