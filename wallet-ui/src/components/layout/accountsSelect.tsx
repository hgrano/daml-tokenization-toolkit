// Copyright (c) 2024 ASX Operations Pty Ltd. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AccountSummary } from "@synfini/wallet-views";

interface AccountsSelectProps {
  accounts?: AccountSummary[];
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  selectedAccount: string;
}

export default function AccountsSelect(props: AccountsSelectProps) {
  return (
      <div>
        {props.accounts !== undefined && (
          <select name="accountSelect" onChange={props.onChange} value={props.selectedAccount}>
              <option value="" defaultValue="">Select one account</option>
            {props.accounts.map(account =>
              <option value={`${account.view.custodian}@${account.view.id.unpack}`} key={account.cid}>{account.view.description} ({account.view.id.unpack})</option>
            )}
          </select>
        )}
      </div>
  );
}
