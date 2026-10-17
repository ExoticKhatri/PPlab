import BrainstormBoard from "./_components/brainstorm-board/BrainstormBoard";
import NetworkMindmap from "./_components/network-mindmap/NetworkMindmap";

export default function Home() {
  return (
    <div className="fixed inset-0">
      <NetworkMindmap />
      <BrainstormBoard />
    </div>
  );
}
