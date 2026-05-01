"use server";

export async function getPincodeDetails(pincode: string) {
  if (!pincode || pincode.length !== 6) {
    return { success: false, error: "Invalid PIN code length." };
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (data && data.length > 0 && data[0].Status === "Success") {
      const postOffices = data[0].PostOffice;
      if (postOffices && postOffices.length > 0) {
        // We take the first result for State and District
        const district = postOffices[0].District;
        const state = postOffices[0].State;
        
        // We can also extract a list of post office names
        const postOfficeNames = postOffices.map((po: any) => po.Name);
        
        return {
          success: true,
          district,
          state,
          postOffices: postOfficeNames
        };
      }
    }
    
    return { success: false, error: "No details found for this PIN code." };
  } catch (error: any) {
    console.error("PIN code API Error:", error);
    return { success: false, error: "Failed to fetch PIN code details." };
  }
}
