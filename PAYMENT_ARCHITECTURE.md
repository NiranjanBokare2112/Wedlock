# Payment Architecture

## Provider status
No payment credentials are configured. Production transactions must not be simulated.

## Required interface
Create a provider-independent adapter for:
- Payment intent creation
- Gateway order creation
- Signed webhook verification
- Refund creation
- Payout and settlement
- Reconciliation

Razorpay or Cashfree may be selected after marketplace KYC and split-payout capability are confirmed.
