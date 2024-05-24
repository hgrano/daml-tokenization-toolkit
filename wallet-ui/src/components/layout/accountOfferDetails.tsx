import React, { useState } from "react";
import Modal from "react-modal";
import {
  CardContainer,
  ContainerColumn,
  ContainerColumnKey,
  ContainerDiv,
  ContainerColumnValue,
} from "./general.styled";
import { AccountOpenOfferSummary } from "@daml.js/synfini-wallet-views-types/lib/Synfini/Wallet/Api/Types";
import { OpenOffer } from "@daml.js/synfini-account-onboarding-open-offer-interface/lib/Synfini/Interface/Onboarding/Account/OpenOffer/OpenOffer";
import { userContext } from "../../App";
import { customAlphabet } from "nanoid"
import { arrayToSet, arrayToMap, truncateParty, setToArray } from "../../Util";
import HoverPopUp from "./hoverPopUp";
import { useWalletUser } from "../../App";
import { walletOperator } from "../../Configuration";

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 12);

interface AccountOpenOfferSummaryProps {
  accountOffer: AccountOpenOfferSummary;
}

export default function AccountOfferDetails(props: AccountOpenOfferSummaryProps) {
  const ledger = userContext.useLedger();
  const { primaryParty } = useWalletUser();

  const [accountOffer, setAccountOffer] = useState<AccountOpenOfferSummary>();
  const [accountName, setAccountName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleClick = (accountOffer: AccountOpenOfferSummary) => {
    setIsModalOpen(!isModalOpen);
    setAccountOffer(accountOffer);
  };

  const handleAccountName: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setAccountName(event.target.value);
  };

  const handleCloseMessageModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleConfirm = () => {
    if (primaryParty === undefined) {
      setMessage("");
      setError("Error primary party not set");
      setIsModalOpen(false);
      return;
    }

    if (accountOffer?.cid !== undefined) {
      ledger
        .exercise(
          OpenOffer.Take,
          accountOffer?.cid,
          {
            accountDescription: accountName,
            accountObservers: arrayToMap([["initialObservers", arrayToSet([walletOperator])]]),
            owner: primaryParty,
            id: { unpack: nanoid() }
          }
        )
        .then((res) => {
          if (res[1]?.length > 0) {
            setMessage("Account created");
            setError("");
          } else {
            setMessage("");
            setError("Operation error!");
          }
          setIsModalOpen(false);
        })
        .catch((err) => {
          setIsModalOpen(false);
          setMessage("");
          setError("Operation error! \n \n Error:" + JSON.stringify(err.errors[0]));
        });
    }
    setIsModalOpen(!isModalOpen);
  };

  const incomingControllers = (props.accountOffer.view.ownerIncomingControlled ? ["Account owner"] : [])
    .concat(setToArray(props.accountOffer.view.additionalControllers.incoming).map(truncateParty));
  const outgoingControllers = (props.accountOffer.view.ownerOutgoingControlled ? ["Account owner"] : [])
  .concat(setToArray(props.accountOffer.view.additionalControllers.outgoing).map(truncateParty));

  return (
    <>
      <div>
        {message !== "" ? (
          <>
            <span
              style={{
                color: "#66FF99",
                fontSize: "1.5rem",
                whiteSpace: "pre-line",
              }}
            >
              {message}
            </span>
          </>
        ) : (
          <>
            <span
              style={{
                color: "#FF6699",
                fontSize: "1.5rem",
                whiteSpace: "pre-line",
              }}
            >
              {error}
            </span>
          </>
        )}
      </div>
      <p></p>
      <CardContainer>
        <h4 className="profile__title">{props.accountOffer.view.description}</h4>
        <ContainerDiv>
          <ContainerColumn>
            <ContainerColumnKey>Register:</ContainerColumnKey>
            <ContainerColumnKey>Incoming transaction controllers:</ContainerColumnKey>
            <ContainerColumnKey>Outgoing transaction controllers:</ContainerColumnKey>
            <p></p>
            <button
              type="button"
              className="button__login"
              style={{ width: "150px" }}
              onClick={() => handleClick(props.accountOffer)}
            >
              Open Account
            </button>
          </ContainerColumn>
          <ContainerColumn>
            <ContainerColumnValue><HoverPopUp triggerText={truncateParty(props.accountOffer.view.custodian)} popUpContent={props.accountOffer.view.custodian} /></ContainerColumnValue>
            <ContainerColumnValue>{incomingControllers.length > 0 ? incomingControllers.join(", ") : "N/A"}</ContainerColumnValue>
            <ContainerColumnValue>{outgoingControllers.join(", ")}</ContainerColumnValue>
          </ContainerColumn>
        </ContainerDiv>
      </CardContainer>
      <Modal
        id="shareSbtModal"
        className="simpleModal"
        isOpen={isModalOpen}
        onRequestClose={handleCloseMessageModal}
        contentLabel="Account Offer Details"
      >
        <form id="modalForm">
          <div style={{ fontSize: "1.5rem" }}>
            <table style={{ width: "300px" }}>
              <caption>{accountOffer?.view.description}</caption>
              <tbody>
                {accountOffer!== undefined && 
                  <tr>
                    <td style={{width: "95px"}}>Register:</td><td>{truncateParty(accountOffer?.view.custodian)}</td>
                  </tr>
                }
                <tr>
                  <td style={{width: "95px"}}>
                    Nickname:
                  </td>
                  <td>
                    <input
                      type="text"
                      id="accountName"
                      name="accountName"
                      style={{ width: "200px" }}
                      value={accountName}
                      onChange={handleAccountName}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="container-inline">
            <button type="button" className="button__login" onClick={handleConfirm}>
              Create
            </button>
            <button type="button" className="button__login" onClick={handleCloseMessageModal}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
