import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { createLedgerContext } from "@daml/react";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthenticationGuard } from "./components/authentication-guard";
import { PageLoader } from "./components/layout/page-loader";
import AuthContextStore from "./store/AuthContextStore";
import MainScreen from "./pages/MainScreen";
import WalletScreen from "./pages/WalletScreen";
import AccountBalanceScreen from "./pages/AccountBalanceScreen";
import SettlementScreen from "./pages/SettlementScreen";

// Context for the party of the user.
export const userContext = createLedgerContext();

const App: React.FC = () => {
  const { isLoading, getAccessTokenSilently } = useAuth0();

  const damlBaseUrl = `${window.location.protocol}//${window.location.host}/daml/`;
  const [token, setToken] = useState<string>("");
  const [primaryParty, setPrimaryParty] = useState<string>('');
  const [readOnly, setReadOnly] = useState<boolean>(false);

  const fetchToken = async () => {
    const authToken = await getAccessTokenSilently();
    setToken(authToken)
    setPrimaryParty(primaryParty);
  };
  
  useEffect(() => {
    fetchToken();
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageLoader />
      </div>
    );
  }
  return (
    <AuthContextStore.Provider value={{token: token, setPrimaryParty: setPrimaryParty, primaryParty: primaryParty, readOnly: readOnly}}>
      <userContext.DamlLedger token={token} party={primaryParty || ''} httpBaseUrl={damlBaseUrl}>
      <Routes>
          <Route path="/" element={<MainScreen />} />
          <Route path="/wallet" element={<AuthenticationGuard component={WalletScreen} />} />
          <Route path="/wallet/account/balance" element={<AuthenticationGuard component={AccountBalanceScreen} />} />
          <Route path="/settlements" element={<AuthenticationGuard component={SettlementScreen} />} />
      </Routes>
      </userContext.DamlLedger>
      </AuthContextStore.Provider>
  );
};

export default App;