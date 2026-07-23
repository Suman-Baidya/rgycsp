import { updatePracticalConfig } from './src/app/actions/practical-classes';

async function test() {
  const workspaceId = 'test-workspace-123';
  const res = await updatePracticalConfig(workspaceId, { capacityPerSlot: 20, offDays: [0, 6] });
  console.log(res);
}
test();
