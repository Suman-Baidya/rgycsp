import { getStateManagers, getAllFranchisesForAssignment } from './src/app/actions/state-manager';

async function test() {
  const res = await getStateManagers();
  console.log("getStateManagers result:");
  console.log(JSON.stringify(res, null, 2));
  
  const fRes = await getAllFranchisesForAssignment();
  console.log("getAllFranchisesForAssignment result:");
  console.log(JSON.stringify(fRes, null, 2));
}

test();
