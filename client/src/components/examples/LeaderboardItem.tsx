import LeaderboardItem from '../LeaderboardItem';

export default function LeaderboardItemExample() {
  return (
    <div className="flex flex-col gap-2 p-8 bg-background max-w-md">
      <LeaderboardItem rank={1} name="Alex Thompson" coins={45678} country="USA" />
      <LeaderboardItem rank={2} name="Maria Garcia" coins={38901} country="Spain" />
      <LeaderboardItem rank={3} name="John Doe" coins={32456} country="UK" />
      <LeaderboardItem rank={15} name="You" coins={5432} country="Global" isCurrentUser />
    </div>
  );
}
