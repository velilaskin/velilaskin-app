# ⛵ Velilaskin - Cost Splitter

A beautiful React web app for splitting costs with your sailing crew, featuring a Scandinavian design with a sailing theme.

## Features

- **Add Expenses**: Record expenses with descriptions, amounts, and who paid
- **Real-time Balances**: See who owes what to whom in real-time
- **Settlement Suggestions**: Get smart suggestions for settling debts
- **Clean Scandinavian Design**: Beautiful, minimal interface with sailing theme
- **Responsive**: Works perfectly on desktop and mobile devices

## Default Participants

The app comes pre-configured with 4 participants:
- **P** - Initial participant
- **S** - Initial participant  
- **K** - Initial participant
- **J** - Initial participant

## How It Works

1. **Add Expenses**: Fill out the form with expense details and who paid
2. **Track Balances**: The app automatically calculates who owes what
3. **Settle Debts**: Use the settlement suggestions to pay each other back

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will open in your browser at `http://localhost:3000`

### Build for Production

Build the app for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage

1. **Adding Expenses**:
   - Enter a description (e.g., "Groceries", "Fuel")
   - Enter the amount in euros
   - Select who paid for the expense
   - Click "Add Expense"

2. **Viewing Balances**:
   - Green cards show who is owed money
   - Red cards show who owes money
   - Neutral cards show settled accounts

3. **Settlement Suggestions**:
   - The app automatically suggests the most efficient way to settle debts
   - Follow the arrows to see who should pay whom

## Design Features

- **Scandinavian Minimalism**: Clean, functional design with plenty of white space
- **Sailing Theme**: Ocean-inspired color palette and wave decorations
- **Responsive Layout**: Adapts beautifully to different screen sizes
- **Smooth Animations**: Subtle hover effects and transitions
- **Accessibility**: High contrast and readable typography

## Technology Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **CSS3**: Custom styling with gradients and animations
- **Inter Font**: Clean, readable typography

## License

ISC License 