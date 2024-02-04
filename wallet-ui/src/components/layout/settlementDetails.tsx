import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SettlementStep, SettlementSummary } from "@daml.js/synfini-wallet-views-types/lib/Synfini/Wallet/Api/Types";
import { formatCurrency, nameFromParty, toDateTimeString } from "../Util";
import { PlusCircleFill, DashCircleFill } from "react-bootstrap-icons";
import styled from "styled-components";
import { Field, FieldPending, FieldSettled } from "./general.styled";
import CopyToClipboard from "./copyToClipboard";
import AuthContextStore from "../../store/AuthContextStore";
import {
  AllocateAndApproveHelper,
  AllocationHelp,
  ApprovalHelp,
  HoldingDescriptor,
} from "@daml.js/settlement-helpers/lib/Synfini/Settlement/Helpers";
import { arrayToSet } from "../../components/Util";
import * as damlTypes from "@daml/types";
import {
  AccountKey,
  Id,
  InstrumentKey,
  Quantity,
} from "@daml.js/daml-finance-interface-types-common/lib/Daml/Finance/Interface/Types/Common/Types";
import { userContext } from "../../App";
import { WalletViewsClient } from "@synfini/wallet-views";
import { Base } from "@daml.js/daml-finance-interface-holding/lib/Daml/Finance/Interface/Holding/Base";
import { Instruction } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Instruction";
import { Batch } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Batch";
import Modal from "react-modal";
import AccountsSelect from "./accountsSelect";
import { fetchDataForUserLedger } from "../UserLedgerFetcher";
import { Tuple2 } from "@daml.js/40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7/lib/DA/Types";
import { InstructionKey } from "@daml.js/daml-finance-interface-settlement/lib/Daml/Finance/Interface/Settlement/Types";

interface SettlementDetailsProps {
  settlement: any;
}

export default function SettlementDetails(props: SettlementDetailsProps) {
  const nav = useNavigate();
  const location = useLocation();
  const [toggleSteps, setToggleSteps] = useState(false);
  const [isActionRequired, setIsActionRequired] = useState<boolean>(false);

  const setToggleCol = () => {
    setToggleSteps((prev) => {
      return !prev;
    });
  };

  const handleSeeDetails = (settlement: SettlementSummary) => {
    nav("/settlement/action", { state: { settlement: settlement } });
  };

  const SettlementDetailsContainer = styled.div`
    border-radius: 12px;
    margin: 15px;
    padding: 10px;
    background-color: #2a2b2f;
    box-shadow: 6.8px 13.6px 13.6px hsl(0deg 0% 0% / 0.29);
  `;

  useEffect(() => {
    const { hash } = location;
    if (hash) {
      const targetElement = document.getElementById(hash.slice(1));
      if (targetElement) {
        const offset = -100;
        const topPosition = targetElement.offsetTop + offset;
        window.scrollTo({
          top: topPosition,
          behavior: "smooth",
        });
      }
    }

    props.settlement.steps.map((step: SettlementStep, index: number) => {
      if (props.settlement.execution === null){
        return setIsActionRequired(true);
      } 
    });
  }, [location]);

  return (
    <SettlementDetailsContainer>
      <div key={props.settlement.batchCid} id={props.settlement.batchId.unpack}>
        <div>
          <div>
            <Field>Transaction ID:</Field>
            <CopyToClipboard
              paramToCopy={props.settlement.batchId.unpack}
              paramToShow={props.settlement.batchId.unpack}
            />
            <br />
          </div>
          <Field>Description:</Field>
          {props.settlement.description}
          <br />
          <Field>Transaction Status:</Field>
          {props.settlement.execution === null ? (
            <FieldPending>Pending</FieldPending>
          ) : (
            <FieldSettled>Settled</FieldSettled>
          )}
          <br />
          <Field>Created Time:</Field>
          {toDateTimeString(props.settlement.witness.effectiveTime)} | Offset:
          {props.settlement.witness.offset} <br />
          {props.settlement.execution !== null && (
            <>
              <Field>Settled Time:</Field>
            </>
          )}
          {props.settlement.execution !== null && toDateTimeString(props.settlement.execution.effectiveTime)}
          {props.settlement.execution !== null && <> | Offset: </>}
          {props.settlement.execution !== null && props.settlement.execution.offset}
        </div>

        <hr></hr>
        {props.settlement.steps.map((step: SettlementStep, index: number) => (
          <div key={index}>
            <h5 className="profile__title">Step {index + 1}</h5>
            <div style={{ margin: "15px" }}>
              <Field>Amount: </Field>
              {step.routedStep.quantity.unit.id.unpack === "AUDN" ? (
                <>{formatCurrency(step.routedStep.quantity.amount, "en-US")}</>
              ) : (
                <>{Number(step.routedStep.quantity.amount)}</>
              )}
              <br />
              <div onClick={setToggleCol} id={step.routedStep.quantity.unit.id.unpack} key={step.instructionCid}>
                <Field>Instrument:</Field>
                {step.routedStep.quantity.unit.id.unpack}
                <Field>Version:</Field>
                {step.routedStep.quantity.unit.version} <br />
                <Field>Sender: </Field>
                {nameFromParty(step.routedStep.sender)}
                <br />
                <Field>Receiver: </Field>
                {nameFromParty(step.routedStep.receiver)}
                <br />
                <Field>Custodian: </Field>
                {nameFromParty(step.routedStep.custodian)}
                <br />
                {toggleSteps ? <DashCircleFill /> : <PlusCircleFill />}
              </div>
              <div
                className="settlement-content"
                style={{ height: toggleSteps ? "60px" : "0px" }}
                key={step.routedStep.quantity.unit.id.unpack}
              >
                Depository: {nameFromParty(step.routedStep.quantity.unit.depository)}
                <br />
                Issuer: {nameFromParty(step.routedStep.quantity.unit.issuer)}
              </div>
              <hr></hr>
            </div>
          </div>
        ))}
        {isActionRequired && <button onClick={() => handleSeeDetails(props.settlement)}>Action Required</button>}
      </div>
    </SettlementDetailsContainer>
  );
}

export function SettlementDetailsAction(props: SettlementDetailsProps) {
  const walletViewsBaseUrl = process.env.REACT_APP_API_SERVER_URL || "";
  const nav = useNavigate();
  const location = useLocation();
  const ctx = useContext(AuthContextStore);
  const [toggleSteps, setToggleSteps] = useState(false);
  const ledger = userContext.useLedger();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [accounts, setAccounts] = useState<any>();
  const [selectAccountInput, setSelectAccountInput] = useState("");
  const [showExecute, setShowExecute] = useState<boolean>(false);

  let walletClient: WalletViewsClient;

  walletClient = new WalletViewsClient({
    baseUrl: walletViewsBaseUrl,
    token: ctx.token,
  });

  const setToggleCol = () => {
    setToggleSteps((prev) => {
      return !prev;
    });
  };

  const handleCloseModal = (path: string) => {
    setIsModalOpen(!isModalOpen);
    if (path !== "") nav("/" + path);
  };

  const handleAccountChange = (event: any) => {
    setSelectAccountInput(event.target.value);
  };

  const SettlementDetailsContainer = styled.div`
    margin: 5px;
    padding: 10px;
  `;

  function acceptanceActions(
    accounts: damlTypes.Map<damlTypes.Party, Id>,
    settlement: SettlementSummary
  ): {
    allocations: damlTypes.Map<Id, AllocationHelp>;
    approvals: damlTypes.Map<Id, ApprovalHelp>;
    pledgeDescriptors: HoldingDescriptor[];
  } {
    let custodianQuantitiesMap: damlTypes.Map<
      { custodian: damlTypes.Party; quantity: Quantity<InstrumentKey, string> },
      Id[]
    > = damlTypes.emptyMap();
    settlement.steps.forEach((step) => {
      if (step.routedStep.receiver === ctx.primaryParty) {
        const k = { custodian: step.routedStep.custodian, quantity: step.routedStep.quantity };
        const ids = custodianQuantitiesMap.get(k) || [];
        ids.push(step.instructionId);
        custodianQuantitiesMap = custodianQuantitiesMap.set(k, ids);
      }
    });
    let allocations: damlTypes.Map<Id, AllocationHelp> = damlTypes.emptyMap();
    let approvals: damlTypes.Map<Id, ApprovalHelp> = damlTypes.emptyMap();
    const pledgeDescriptors: HoldingDescriptor[] = [];

    // Update allocations
    settlement.steps.forEach((step) => {
      if (step.routedStep.sender === ctx.primaryParty) {
        const availablePassThroughFroms =
          custodianQuantitiesMap.get({ custodian: step.routedStep.custodian, quantity: step.routedStep.quantity }) ||
          [];
        const accountId = accounts.get(step.routedStep.custodian);
        if (accountId !== undefined) {
          if (availablePassThroughFroms.length > 0) {
            const passThroughFromId = availablePassThroughFroms.pop();
            if (passThroughFromId === undefined) {
              throw Error("Internal error");
            }
            allocations = allocations.set(step.instructionId, {
              tag: "PassThroughFromHelp",
              value: { accountId, instructionIndex: passThroughFromId },
            });
            approvals = approvals.set(passThroughFromId, {
              tag: "PassThroughToHelp",
              value: { accountId, instructionIndex: step.instructionId },
            });
          } else {
            allocations = allocations.set(step.instructionId, { tag: "PledgeFromFungiblesHelp", value: {} });
            const holdingDescriptor = {
              custodian: step.routedStep.custodian,
              instrument: step.routedStep.quantity.unit,
            };
            pledgeDescriptors.push(holdingDescriptor);
          }
        }
      } else if (
        step.routedStep.sender === step.routedStep.custodian &&
        step.routedStep.receiver === step.routedStep.quantity.unit.issuer &&
        step.routedStep.quantity.unit.issuer === ctx.primaryParty
      ) {
        // This is a "mint" instruction to be approved by the issuer
        allocations = allocations.set(step.instructionId, { tag: "IssuerCreditHelp", value: {} });
      }
    });

    // Update approvals
    settlement.steps
      .filter((step) => !approvals.has(step.instructionId))
      .forEach((step) => {
        if (step.routedStep.receiver === ctx.primaryParty) {
          const accountId = accounts.get(step.routedStep.custodian);
          if (accountId !== undefined) {
            approvals = approvals.set(step.instructionId, { tag: "TakeDeliveryHelp", value: accountId });
          }
        } else if (
          step.routedStep.receiver === step.routedStep.custodian &&
          step.routedStep.sender === step.routedStep.quantity.unit.issuer &&
          step.routedStep.quantity.unit.issuer === ctx.primaryParty
        ) {
          // This is a "burn" instruction to be approved by the issuer
          approvals = approvals.set(step.instructionId, { tag: "ApproveIssuerDebitHelp", value: {} });
        }
      });

    return {
      allocations,
      approvals,
      pledgeDescriptors,
    };
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log("submit", selectAccountInput);
    const splitAccountInput = selectAccountInput.split("@");
    let custodianToAccount: damlTypes.Map<damlTypes.Party, Id> = damlTypes.emptyMap();
    custodianToAccount = custodianToAccount.set(splitAccountInput[0], { unpack: splitAccountInput[1] });

    const settlement: SettlementSummary = props.settlement;
    const { allocations, approvals, pledgeDescriptors } = acceptanceActions(custodianToAccount, settlement);
    let holdings: damlTypes.Map<HoldingDescriptor, damlTypes.ContractId<Base>[]> = damlTypes.emptyMap();

    for (const holdingDescriptor of pledgeDescriptors) {
      if (!holdings.has(holdingDescriptor)) {
        const accountId = custodianToAccount.get(holdingDescriptor.custodian);
        if (accountId !== undefined) {
          const account = {
            custodian: holdingDescriptor.custodian,
            owner: ctx.primaryParty,
            id: accountId,
          };
          const activeHoldings = await walletClient.getHoldings({ account, instrument: holdingDescriptor.instrument });
          holdings = holdings.set(
            holdingDescriptor,
            activeHoldings.holdings.map((h) => h.cid)
          );
        }
      }
    }

    let instructions: damlTypes.Map<Id, damlTypes.ContractId<Instruction>> = damlTypes.emptyMap();
    settlement.steps.forEach((step) => (instructions = instructions.set(step.instructionId, step.instructionCid)));

    await ledger
      .createAndExercise(
        AllocateAndApproveHelper.AllocateAndApprove,
        {
          actors: arrayToSet([ctx.primaryParty]),
          instructions,
          holdings,
          allocations,
          approvals,
        },
        {}
      )
      .then((res) => {
        console.log("res??", res);
        setMessage("Account allocated with success!");
        setIsModalOpen(!isModalOpen);
      })
      .catch((err) => {
        setError("error when allocating account!" + err.errors[0]);
        setIsModalOpen(!isModalOpen);
      });
  };

  const handleExecute = async () => {
    await ledger
      .exercise(Batch.Settle, props.settlement?.batchCid, {
        actors: arrayToSet([ctx.primaryParty]),
      })
      .then((res) => {
        setMessage("Settlement submitted with success!");
        setIsModalOpen(!isModalOpen);
        console.log("resp", res);
      })
      .catch((err) => {
        console.log("err", err);
        setError("error when executing!" + err.errors[0]);
        setIsModalOpen(!isModalOpen);
      });
  };

  const fetchAccounts = async (custodian: string) => {
    if (ctx.primaryParty !== "") {
      const respAcc = await walletClient.getAccounts({ owner: ctx.primaryParty, custodian: custodian });
      setAccounts(respAcc.accounts);
    }
  };

  useEffect(() => {
    const { hash } = location;
    if (hash) {
      const targetElement = document.getElementById(hash.slice(1));
      if (targetElement) {
        const offset = -100;
        const topPosition = targetElement.offsetTop + offset;
        window.scrollTo({
          top: topPosition,
          behavior: "smooth",
        });
      }
    }
  }, [location]);

  useEffect(() => {
    fetchDataForUserLedger(ctx, ledger);
  }, [ctx, ledger]);

  useEffect(() => {
    // STEPS LOOP THROUGH
    props.settlement.steps.map((step: any, index: number) => {
      let inputSelected = "";
      const approval_values: {} | AccountKey | Tuple2<AccountKey, InstructionKey> = step.approval.value;
      let approvals_arr = Object.values(approval_values);

      // CHECK STEPS APPROVAL / ALLOCATION
      if (step.approval.tag !== "Unapproved" && step.routedStep.receiver === ctx.primaryParty) {
        if (selectAccountInput === "") {
          if (typeof approvals_arr[0] === "string") {
            fetchAccounts(approvals_arr[0]);
            inputSelected = approvals_arr[0] + "@" + approvals_arr[2].unpack;
            setSelectAccountInput(inputSelected);
          } else {
            fetchAccounts(approvals_arr[0].custodian);
            inputSelected = approvals_arr[0].custodian + "@" + approvals_arr[0].id.unpack;
            setSelectAccountInput(inputSelected);
          }
        }
      } else if (step.routedStep.sender === ctx.primaryParty) {
        fetchAccounts(step.routedStep.custodian);
        ledger.fetch(Base, step.allocation.value).then((res) => {
          inputSelected = res?.payload.account.custodian + "@" + res?.payload.account.id.unpack;
          setSelectAccountInput(inputSelected);
        });
      } else {
        fetchAccounts(step.routedStep.custodian);
      }

      // CHECK IF CAN EXECUTE
      if (
        step.approval.tag !== "Unapproved" &&
        step.allocation.tag !== "Unallocated" &&
        (step.allocation.tag === "Pledge" || step.allocation.tag === "CreditReceiver")
      ) {
        fetchAccounts(approvals_arr[0].custodian);
        setShowExecute(true);
      } else if (step.approval.tag === "Unapproved" || step.allocation.tag === "Unallocated") {
        setShowExecute(false);
      }
    });
  }, []);

  console.log("settlement", props.settlement);
  return (
    <SettlementDetailsContainer>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
          <div style={{ padding: "10px" }}>Select Account:</div>
          <div>
            <AccountsSelect accounts={accounts} onChange={handleAccountChange} selectedAccount={selectAccountInput} />
          </div>
        </div>
        <div key={props.settlement.batchId.unpack} id={props.settlement.batchId.unpack}>
          <div>
            <div>
              <Field>Transaction ID:</Field>
              <CopyToClipboard
                paramToCopy={props.settlement.batchId.unpack}
                paramToShow={props.settlement.batchId.unpack}
              />
              <br />
            </div>
            <Field>Description:</Field>
            {props.settlement.description}
            <br />
            <Field>Transaction Status:</Field>
            {props.settlement.execution === null ? (
              <FieldPending>Pending</FieldPending>
            ) : (
              <FieldSettled>Settled</FieldSettled>
            )}
            <br />
            <Field>Created Time:</Field>
            {toDateTimeString(props.settlement.witness.effectiveTime)} | Offset:
            {props.settlement.witness.offset} <br />
            {props.settlement.execution !== null && (
              <>
                <Field>Settled Time:</Field>
              </>
            )}
            {props.settlement.execution !== null && toDateTimeString(props.settlement.execution.effectiveTime)}
            {props.settlement.execution !== null && <> | Offset: </>}
            {props.settlement.execution !== null && props.settlement.execution.offset}
          </div>

          <hr></hr>
          {props.settlement.steps.map((step: SettlementStep, index: number) => {
            return (
              <>
                <div key={index}>
                  <h5 className="profile__title">Step {index + 1}</h5>
                  <div style={{ margin: "15px" }}>
                    <Field>Amount: </Field>
                    {step.routedStep.quantity.unit.id.unpack === "AUDN" ? (
                      <>{formatCurrency(step.routedStep.quantity.amount, "en-US")}</>
                    ) : (
                      <>{Number(step.routedStep.quantity.amount)}</>
                    )}
                    <br />
                    <div onClick={setToggleCol} id={step.routedStep.quantity.unit.id.unpack} key={step.instructionCid}>
                      <Field>Instrument:</Field>
                      {step.routedStep.quantity.unit.id.unpack}
                      <Field>Version:</Field>
                      {step.routedStep.quantity.unit.version} <br />
                      <Field>Sender: </Field>
                      {nameFromParty(step.routedStep.sender)}
                      <br />
                      <Field>Receiver: </Field>
                      {nameFromParty(step.routedStep.receiver)}
                      <br />
                      <Field>Custodian: </Field>
                      {nameFromParty(step.routedStep.custodian)}
                      <br />
                      <Field>Allocation: </Field>
                      {step.allocation.tag === "Unallocated" ? (
                        <span style={{ color: "hsl(0, 90%, 80%)" }}>{step.allocation.tag}</span>
                      ) : (
                        <>{step.allocation.tag}</>
                      )}
                      <br />
                      <Field>Approval: </Field>
                      {step.approval.tag === "Unapproved" ? (
                        <span style={{ color: "hsl(0, 90%, 80%)" }}>{step.approval.tag}</span>
                      ) : (
                        <>{step.approval.tag}</>
                      )}
                      <br />
                      {toggleSteps ? <DashCircleFill /> : <PlusCircleFill />}
                    </div>
                    <div
                      className="settlement-content"
                      style={{ height: toggleSteps ? "60px" : "0px" }}
                      key={step.routedStep.quantity.unit.id.unpack}
                    >
                      Depository: {nameFromParty(step.routedStep.quantity.unit.depository)}
                      <br />
                      Issuer: {nameFromParty(step.routedStep.quantity.unit.issuer)}
                    </div>
                    <hr></hr>
                  </div>
                </div>
              </>
            );
          })}
          <br></br>
          <button type="submit" className="button__login" style={{ width: "150px" }}>
            Submit
          </button>
          {showExecute && (
            <button type="button" className="button__login" style={{ width: "150px" }} onClick={() => handleExecute()}>
              Execute
            </button>
          )}
        </div>
      </form>
      <Modal
        id="handleCloseMessageModal"
        className="MessageModal"
        isOpen={isModalOpen}
        onRequestClose={() => handleCloseModal}
        contentLabel="Settlement Modal"
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
                onClick={() => handleCloseModal(`settlements#${props.settlement.batchId.unpack}`)}
              >
                OK
              </button>
            </div>
          </div>
          <p></p>
        </>
      </Modal>
    </SettlementDetailsContainer>
  );
}
