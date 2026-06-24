import { Suspense } from 'react';
import RoomClient from './RoomClient';

export default function CollaborationRoomPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#faf9f7] text-[#6b6b6b]">Loading Room...</div>}>
      <RoomClient />
    </Suspense>
  );
}
