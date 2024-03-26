import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { PageLoader } from "../components/layout/page-loader";
import { PageLayout } from "../components/PageLayout";
import { AccountSummary } from "@daml.js/synfini-wallet-views-types/lib/Synfini/Wallet/Api/Types";
import AccountBalances, { AccountBalanceSummary } from "../components/layout/accountBalances";
import { useWalletViews, useWalletUser } from "../App";

const WalletScreen: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const walletClient = useWalletViews();
  const { primaryParty } = useWalletUser();

  const [accountBalances, setAccountBalances] = useState<AccountBalanceSummary[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (primaryParty !== undefined) {
        const resp = await walletClient.getAccounts({ owner: primaryParty, custodian: null });
        return resp.accounts;
      } else {
        return [];
      }
    };

    const fetchBalances = async (account: AccountSummary) => {
      if (primaryParty !== undefined) {
        const resp = await walletClient.getBalance({
          account: {
            owner: primaryParty,
            custodian: account.view.custodian,
            id: account.view.id,
          },
        });
        return resp.balances;
      }
      return [];
    };

    const fetchAccountBalances = async () => {
      const accounts = await fetchAccounts();
      const accountsWithBalances = await Promise.all(
        accounts.map(async (account) => {
          const balances = await fetchBalances(account);
          return { account, balances }
        })
      );
      setAccountBalances(accountsWithBalances);
    }
    fetchAccountBalances();
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
      {isAuthenticated && user !== undefined && (
        <div className="profile-grid">
          <div className="profile__header">
            <img src={user.picture} alt="Profile" className="profile__avatar" />
            <div className="profile__headline">
              <h2 className="profile__title">{user.name}</h2>
              <span className="profile__description">{user.email}</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <AccountBalances accountBalances={accountBalances} />
      </div>
    </PageLayout>
  );
};

export default WalletScreen;
