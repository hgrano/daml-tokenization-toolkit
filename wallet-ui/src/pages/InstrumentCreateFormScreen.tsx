import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { userContext } from "../App";
import { PageLayout } from "../components/PageLayout";
import {
  ContainerColumn,
  ContainerColumnField,
  ContainerDiv,
  DivBorderRoundContainer,
} from "../components/layout/general.styled";
import { Party } from "@daml/types";
import { arrayToMap, arrayToSet } from "../components/Util";
import { Issuer as TokenIssuer } from "@daml.js/synfini-issuer-onboarding-instrument-token-interface/lib/Synfini/Interface/Onboarding/Issuer/Instrument/Token/Issuer";
import { v4 as uuid } from "uuid";
import Modal from "react-modal";
import { useWalletUser } from "../hooks/WalletViews";

export const InstrumentCreateFormScreen: React.FC = () => {
  const nav = useNavigate();
  const { state } = useLocation();
  const ledger = userContext.useLedger();
  const { primaryParty } = useWalletUser();
  const wallet_depository = process.env.REACT_APP_PARTIES_ENVIRONMENTAL_TOKEN_DEPOSITORY || "";
  const wallet_operator = process.env.REACT_APP_PARTIES_WALLET_OPERATOR || "";
  const wallet_public = process.env.REACT_APP_PARTIES_PUBLIC || "";

  const [productTypeInput, setProductTypeInput] = useState("");
  const [productVersionInput, setProductVersionInput] = useState("");
  const [certificateQuantityInput, setCertificateQuantity] = useState("");
  const [ipfsInput, setIpfsInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [observerInput, setObserverInput] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isMessageOpen, setIsMessageOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleProductTypeInput = (event: any) => {
    setProductTypeInput(event.target.value);
  };

  const handleProductVersionInput = (event: any) => {
    setProductVersionInput(event.target.value);
  };

  const handleCertificateQuantity = (event: any) => {
    setCertificateQuantity(event.target.value);
  };

  const handleIpfsInput = (event: any) => {
    setIpfsInput(event.target.value);
  };

  const handlePriceInput = (event: any) => {
    setPriceInput(event.target.value);
  };

  const handleObserverInput = (event: any) => {
    setObserverInput(event.target.value);
  };

  const handleCloseMessageModal = (path: string) => {
    setIsMessageOpen(!isMessageOpen);
    if (path !== "") nav("/" + path);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (primaryParty === undefined) {
      setMessage("Error primary party not set");
      setIsMessageOpen(true);
      return;
    }

    if (state.issuer.token.cid !== undefined) {
      setIsSubmitting(true);
      const idUUID = uuid();

      const observers: Party[] = [];
      observers.push(wallet_depository);
      observers.push(wallet_operator);
      observers.push(wallet_public);
      observers.push(primaryParty);
      if (observerInput!== undefined && observerInput !== "") {
        observers.push(observerInput);
      }

      const desc_instrument = {
        ipfs: ipfsInput,
        certificateQuantity: certificateQuantityInput,
        price: priceInput
      };

      await ledger
        .exercise(TokenIssuer.CreateInstrument, state.issuer.token.cid, {
          token: {
            instrument: {
              depository: wallet_depository,
              issuer: primaryParty,
              id: { unpack: productTypeInput+"-"+productVersionInput },
              version: idUUID,
            },
            description: JSON.stringify(desc_instrument),
            validAsOf: new Date().toISOString(),
          },
          observers: arrayToMap([["initialObservers", arrayToSet(observers)]]),
        })
        .then((res) => {
          if (res.length > 1) {
            setMessage("Instrument created with success!");
            setIsMessageOpen(true);
          }
        })
        .catch((err) => {
          setIsMessageOpen(true);
          setError("Error - Contact the Administrator.");
        });
    }
  };

  return (
    <PageLayout>
      <h3 className="profile__title" style={{ marginTop: "10px" }}>
        Create Instrument
      </h3>
      <DivBorderRoundContainer>
        <form onSubmit={handleSubmit}>
          <ContainerDiv>
            <ContainerColumn>
              <ContainerColumnField>Product Type:</ContainerColumnField>
              <ContainerColumnField>Product Version:</ContainerColumnField>
              <ContainerColumnField>Certificate Quantity:</ContainerColumnField>
              <ContainerColumnField>IPFS url:</ContainerColumnField>
              <ContainerColumnField>Issuing Price:</ContainerColumnField>
              <ContainerColumnField>Promote To:</ContainerColumnField>
              <p></p>
              <button type="submit" className="button__login" disabled={isSubmitting}>
                Submit
              </button>
            </ContainerColumn>
            <ContainerColumn>
              <ContainerColumnField>
                <input
                  type="text"
                  id="productType"
                  name="produtType"
                  style={{ width: "150px" }}
                  onChange={handleProductTypeInput}
                />
              </ContainerColumnField>
              <ContainerColumnField>
                <input
                  type="text"
                  id="productVersion"
                  name="produtVersion"
                  style={{ width: "150px" }}
                  onChange={handleProductVersionInput}
                />
              </ContainerColumnField>
              <ContainerColumnField>
                <input
                  type="text"
                  id="certificateQuantity"
                  name="certificateQuantity"
                  style={{ width: "150px" }}
                  onChange={handleCertificateQuantity}
                />
              </ContainerColumnField>
              <ContainerColumnField>
                <input type="text" id="url" name="url" style={{ width: "150px" }} onChange={handleIpfsInput} />
              </ContainerColumnField>
              <ContainerColumnField>
                <input type="text" id="price" name="price" style={{ width: "150px" }} onChange={handlePriceInput} />
              </ContainerColumnField>
              <ContainerColumnField>
                <input
                  type="text"
                  id="observer"
                  name="observer"
                  style={{ width: "150px" }}
                  onChange={handleObserverInput}
                />
              </ContainerColumnField>
            </ContainerColumn>
          </ContainerDiv>
        </form>
      </DivBorderRoundContainer>
      <Modal
        id="handleCloseMessageModal"
        className="MessageModal"
        isOpen={isMessageOpen}
        onRequestClose={() => handleCloseMessageModal}
        contentLabel="Create Instrument"
      >
        <>
          <div>
            {message !== "" ? (
              <span style={{ color: "#66FF99", fontSize: "1.5rem", whiteSpace: "pre-line" }}>{message}</span>
            ) : (
              <span style={{ color: "#FF6699", fontSize: "1.5rem", whiteSpace: "pre-line" }}>{error}</span>
            )}
          </div>
          <p></p>
          <div className="containerButton">
            <div>
              <button
                type="button"
                className="button__login"
                style={{ width: "150px" }}
                onClick={() => handleCloseMessageModal("issuers")}
              >
                OK
              </button>
            </div>
          </div>
          <p></p>
        </>
      </Modal>
    </PageLayout>
  );
};
