import BottomNav from '../BottomNav';

export default function BottomNavExample() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Navigation Preview</h1>
        <p className="text-muted-foreground">The bottom navigation is visible at the bottom of the screen</p>
      </div>
      <BottomNav />
    </div>
  );
}
