import TeamMemberCard from '../TeamMemberCard';

export default function TeamMemberCardExample() {
  return (
    <div className="flex flex-col gap-4 p-8 bg-background max-w-md">
      <TeamMemberCard 
        name="Sarah Johnson"
        coins={2450}
        level={12}
        referrals={8}
        joinedDate="2 days ago"
        isDirect
      />
      <TeamMemberCard 
        name="Mike Chen"
        coins={1890}
        level={9}
        referrals={3}
        joinedDate="1 week ago"
        isDirect={false}
      />
    </div>
  );
}
