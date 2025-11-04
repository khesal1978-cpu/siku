import ReferralCard from '../ReferralCard';

export default function ReferralCardExample() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-8">
      <div className="max-w-md w-full">
        <ReferralCard referralCode="PING2024XYZ" />
      </div>
    </div>
  );
}
