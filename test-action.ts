import { createPracticalSlot } from './src/app/actions/practical-classes';

async function test() {
  const workspaceId = 'test-workspace-123'; // Use a real one if needed, but we expect foreign key failure if it doesn't exist
  const res = await createPracticalSlot(workspaceId, { startTime: '10:00', endTime: '11:00', order: 1 });
  console.log(res);
}
test();
