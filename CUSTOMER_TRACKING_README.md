# Customer Tracking System

This document describes the new customer tracking functionality added to the Daily Ledger system.

## Features Added

### 1. Customer Name Field
- Added `customerName` field to all ledger entries
- Customer name is now required when creating new entries
- Customer names are displayed in the ledger table

### 2. Multiple Entries for Same Customer on Same Day
- If the same customer provides more material/weight on the same day, the system automatically adds the new weight to the existing entry
- All calculations (totals, balances, etc.) are updated automatically
- No duplicate entries are created for the same customer on the same day

### 3. Activity Tracking
- `weightAdditionCount`: Tracks how many times weight was added for a customer on a specific day
- `lastWeightAddition`: Records the timestamp of the last weight addition
- `notes`: Optional field for additional information about each entry

### 4. Customer Accounts Page
- Customer names in the ledger table are now clickable
- Clicking on a customer name opens a detailed Customer Accounts modal
- Shows complete transaction history for that customer since the first day
- Displays summary statistics (total weight, credit, debit, net balance, entry count)

## Database Schema Changes

### LedgerEntry Model Updates
```javascript
{
  customerName: String,           // Required field
  weightAdditionCount: Number,    // Default: 1
  lastWeightAddition: Date,       // Default: current timestamp
  notes: String                   // Optional field
}
```

### New Indexes
- Compound index on `{ date: 1, customerName: 1, createdAt: 1 }`
- Index on `{ customerName: 1, date: 1 }`

## API Changes

### Updated Endpoints
- `POST /api/ledger`: Now handles customer logic for same-day entries
- `GET /api/ledger/customer/[name]`: New endpoint for customer account details

### POST /api/ledger Behavior
1. **New Customer Entry**: Creates a new entry if customer doesn't exist for the day
2. **Existing Customer Entry**: Updates existing entry by adding new weight and recalculating credit
3. **Response**: Returns success message indicating whether entry was created or updated

## UI Components

### New Components
- `CustomerAccounts.jsx`: Modal component for displaying customer transaction history
- Updated `LedgerForm.jsx`: Added customer name and notes fields
- Updated `LedgerTable.jsx`: Added customer column with clickable names

### Form Fields
- **Customer Name**: Required text input
- **Notes**: Optional textarea for additional information
- All existing fields remain unchanged

## Migration

### For Existing Data
If you have existing ledger entries without customer names, run the migration script:

```bash
node src/scripts/migrate-ledger-entries.js
```

This will:
- Find all entries without customer names
- Assign default customer names (Customer_XXXXXX)
- Set default values for new fields

## Usage Examples

### Adding New Customer Entry
1. Fill in customer name, date, product type, weight, and rate
2. Submit the form
3. Entry is created with weightAdditionCount = 1

### Adding More Weight for Same Customer on Same Day
1. Fill in the same customer name and date
2. Enter additional weight and rate
3. System automatically updates existing entry
4. weightAdditionCount increases by 1
5. Total weight and credit are recalculated

### Viewing Customer Account
1. Click on any customer name in the ledger table
2. Customer Accounts modal opens
3. View complete transaction history and summary statistics

## Benefits

1. **Better Organization**: All customer transactions are grouped and easily accessible
2. **Automatic Consolidation**: No duplicate entries for same-day customer transactions
3. **Activity Tracking**: Monitor how many times customers add weight per day
4. **Customer History**: Complete transaction history for each customer
5. **Improved Reporting**: Better insights into customer behavior and patterns

## Technical Notes

- All existing functionality remains backward compatible
- Database indexes ensure efficient queries for customer-based operations
- The system automatically handles balance recalculations
- Customer names are case-insensitive for search purposes
- Weight additions are tracked with timestamps for audit purposes

## Future Enhancements

Potential improvements that could be added:
- Customer contact information
- Customer categories or types
- Customer-specific pricing rules
- Customer performance analytics
- Export customer-specific reports
- Customer payment history tracking
