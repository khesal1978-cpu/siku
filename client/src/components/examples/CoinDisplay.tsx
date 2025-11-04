import CoinDisplay from '../CoinDisplay';

export default function CoinDisplayExample() {
  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen bg-background p-8">
      <CoinDisplay amount={1234.56} label="Mining Balance" size="xl" showAnimation />
      <CoinDisplay amount={89.50} label="Pending Rewards" size="md" />
    </div>
  );
}
