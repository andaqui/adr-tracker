# ADR-0003: Order Cancellation for Inventory Shortage

Status: Accepted
Date: 2023-07-12
Tags: orders, inventory

## Context

Inventory can become unavailable between order placement and fulfillment, requiring manual intervention.

## Decision

Automate order cancellation:

- Cancel small orders (≤3 items) if any item unavailable
- For larger orders, cancel only if >40% unavailable
- Send notifications and process refunds within 24h

## Consequences

**Positive**: Reduced manual work, faster resolution
**Negative**: Added complexity in order processing

## Implementation

Update OrderProcessingService with verification logic.
