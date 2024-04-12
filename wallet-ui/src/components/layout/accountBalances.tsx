import { useNavigate } from "react-router-dom";
import { AccountSummary, Balance } from "@daml.js/synfini-wallet-views-types/lib/Synfini/Wallet/Api/Types";
import { formatCurrency, nameFromParty } from "../../Util";
import { Coin } from "react-bootstrap-icons";
import HoverPopUp from "./hoverPopUp";
import InstrumentPopDetails from "./instrumentPopDetails";
import { useState } from "react";
import { InstrumentKey } from "@daml.js/daml-finance-interface-types-common/lib/Daml/Finance/Interface/Types/Common/Types";

export type AccountBalanceSummary = {
  account: AccountSummary,
  balances: Balance[]
};

export default function AccountBalances(props: { accountBalances: AccountBalanceSummary[] }) {
  const nav = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleRedeem = (balance: Balance, account: AccountSummary) => {
    nav("/wallet/account/balance/redeem", { state: { balance, account } });
  };

  const handleInstrumentModal = (instrument: InstrumentKey) => {
    setIsOpen(!isOpen);
    nav("/asset", { state: { instrument } });
  }

  const tableRows: [AccountSummary, JSX.Element[]][] = props.accountBalances.map(accountBalance => {
    const trs = accountBalance.balances.map(balance => {
      const actionButton =
        (balance.instrument.id.unpack === process.env.REACT_APP_STABLECOIN_INSTRUMENT_ID) ?
          (<>&nbsp;<button onClick={() => handleRedeem(balance, accountBalance.account)}>Redeem</button></>) :
          (<></>);

      const trKey = [
        balance.account.custodian,
        balance.account.id.unpack,
        balance.instrument.depository,
        balance.instrument.issuer,
        balance.instrument.id.unpack,
        balance.instrument.version
      ].join(" ");
      return (
        <tr key={trKey}>
          <td>
            {balance.instrument.id.unpack === process.env.REACT_APP_STABLECOIN_INSTRUMENT_ID && (
              <>
                <Coin />
                &nbsp;&nbsp;
              </>
            )}
            {balance.instrument.id.unpack}
          </td>
          <td>
            <a onClick={() => handleInstrumentModal(balance.instrument)}>
              {balance.instrument.version}
            </a>
          </td>
          <td><HoverPopUp triggerText={nameFromParty(balance.instrument.issuer)} popUpContent={balance.instrument.issuer} /></td>
          <td>
            {formatCurrency((parseFloat(balance.unlocked) + parseFloat(balance.locked)).toString(), "en-US")}
          </td>
          <td>{formatCurrency(balance.unlocked, "en-US")}{actionButton}</td>
        </tr>
      );
    });

    return [accountBalance.account, trs];
  });

  return (
    <>
      {
        tableRows.map(row => {
          const [account, trs] = row;
          return (
            <div>
              <div style={{ marginTop: "15px" }}>
                <h4 className="profile__title">{account.view.description}</h4>
                <h5 className="profile__title">Provider: {account.view.custodian}</h5>
                <h5 className="profile__title">Account ID: {account.view.id.unpack}</h5>
              </div>
              <div style={{ margin: "10px", padding: "10px" }}>
                <table className="assets">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Variant</th>
                      <th>Issuer</th>
                      <th>Balance</th>
                      <th>Available</th>
                    </tr>
                  </thead>
                  <tbody>{trs}</tbody>
                </table>
              </div>
            </div>
          );
        })
      }
    </>
  ) 
};
