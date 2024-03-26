import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { PageLoader } from "../components/layout/page-loader";
import { PageLayout } from "../components/PageLayout";
import { useLocation } from "react-router-dom";
import { SettlementDetailsAction } from "../components/layout/settlementDetails";
import { DivBorderRoundContainer } from "../components/layout/general.styled";
import { SettlementSummary } from "@daml.js/synfini-wallet-views-types/lib/Synfini/Wallet/Api/Types";

type SettlementActionScreenState = {
  settlement?: SettlementSummary
}

export const SettlementActionScreen: React.FC = () => {
  const { state } = useLocation() as { state: SettlementActionScreenState } ;
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div>
        <PageLoader />
      </div>
    );
  }

  return (
    <PageLayout>
      <DivBorderRoundContainer>
          <div>
            {state.settlement !== undefined && (
              <SettlementDetailsAction
                settlement={state.settlement}
                key={state.settlement?.batchCid}
              ></SettlementDetailsAction>
            )}
          </div>
      </DivBorderRoundContainer>
    </PageLayout>
  );
};
