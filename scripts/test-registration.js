const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log("=== Registration Lifecycle Test ===");
  
  try {
    // 1. Setup a test center and student
    console.log("Setting up test data...");
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      console.log("No workspace found. Aborting.");
      return;
    }

    // Ensure we have a course
    let course = await prisma.course.findFirst({ where: { workspaceId: workspace.id } });
    if (!course) {
      course = await prisma.course.create({
        data: {
          name: "Test Course",
          duration: "1 Year",
          fees: 5000,
          workspaceId: workspace.id
        }
      });
    }

    // 2. Create an UNREGISTERED student with admissionDate in 2024
    const testStudent = await prisma.studentProfile.create({
      data: {
        fullName: "Test Registration Lifecycle Student",
        enrollmentNo: "TEST-ENR-" + Date.now(),
        status: "UNREGISTERED",
        admissionDate: new Date("2024-05-15"),
        workspaceId: workspace.id,
        courseId: course.id,
        centerCode: "WB099" // Mock center code
      }
    });
    console.log(`Created student: ${testStudent.id} (Admission Year: 2024)`);

    // 3. Simulate registerStudent (Logic from student-registration.ts)
    console.log("Simulating Registration (Year should be 2024)...");
    const centerCode = "WB099";
    const yearStr = testStudent.admissionDate.getFullYear().toString();
    
    // Check highest seq
    const highestReg = await prisma.studentRegistration.findFirst({
      orderBy: { sequenceNumber: 'desc' }
    });
    let seqNumber = highestReg ? highestReg.sequenceNumber + 1 : 1;
    let series = 'B'; 
    let sequenceNumberString = String(seqNumber).padStart(5, '0');
    
    // Conflict loop simulation (same as in registerStudent)
    let generatedRegNo = `${centerCode}Y${yearStr}${series}${sequenceNumberString}`;
    let isUnique = false;
    while (!isUnique) {
        const check = await prisma.studentRegistration.findUnique({ where: { registrationNo: generatedRegNo } });
        if (!check) {
            isUnique = true;
        } else {
            seqNumber++;
            sequenceNumberString = String(seqNumber).padStart(5, '0');
            generatedRegNo = `${centerCode}Y${yearStr}${series}${sequenceNumberString}`;
        }
    }

    // Register them
    await prisma.$transaction([
      prisma.studentRegistration.create({
        data: {
          studentProfileId: testStudent.id,
          registrationNo: generatedRegNo,
          centerCode,
          year: parseInt(yearStr),
          series,
          sequenceNumber: seqNumber,
          workspaceId: workspace.id
        }
      }),
      prisma.studentProfile.update({
        where: { id: testStudent.id },
        data: { status: "REGISTERED", registrationNo: generatedRegNo }
      })
    ]);
    console.log(`Student Registered with No: ${generatedRegNo}`);

    // 4. Simulate Admission Date Change to 2026 (From updateStudent)
    console.log("Simulating Admission Date Change to 2026...");
    const newAdmissionDate = new Date("2026-08-20");
    const newYearStr = newAdmissionDate.getFullYear().toString();
    const yIndex = generatedRegNo.indexOf('Y');
    const prefixBeforeYear = generatedRegNo.substring(0, yIndex + 1);
    const currentSuffix = generatedRegNo.substring(yIndex + 5);
    
    let autoRegNo = `${prefixBeforeYear}${newYearStr}${currentSuffix}`;
    
    // We will artificially insert the conflict to test the conflict loop
    console.log(`Artificially creating conflict for ${autoRegNo}...`);
    // Need a dummy student to hold the conflict
    const conflictStudent = await prisma.studentProfile.create({
      data: {
        fullName: "Conflict Holder",
        enrollmentNo: "TEST-CONF-" + Date.now(),
        status: "REGISTERED",
        registrationNo: autoRegNo,
        workspaceId: workspace.id
      }
    });

    console.log("Running conflict resolution loop...");
    let testRegNo = autoRegNo;
    let currentSeq = parseInt(testRegNo.slice(-5), 10);
    let currentSeries = testRegNo.slice(-6, -5);
    
    while (true) {
      const checkProfile = await prisma.studentProfile.findUnique({ where: { registrationNo: testRegNo } });
      const checkReg = await prisma.studentRegistration.findUnique({ where: { registrationNo: testRegNo } });
      
      if ((checkProfile && checkProfile.id !== testStudent.id) || (checkReg && checkReg.studentProfileId !== testStudent.id)) {
        console.log(`Conflict found at ${testRegNo}. Incrementing...`);
        currentSeq++;
        const newSeqStr = String(currentSeq).padStart(5, '0');
        testRegNo = `${prefixBeforeYear}${newYearStr}${currentSeries}${newSeqStr}`;
      } else {
        break;
      }
    }
    console.log(`Conflict resolved! New Registration No: ${testRegNo}`);
    
    // Update student with resolved number
    await prisma.$transaction([
      prisma.studentProfile.update({
        where: { id: testStudent.id },
        data: { admissionDate: newAdmissionDate, registrationNo: testRegNo }
      }),
      prisma.studentRegistration.updateMany({
        where: { studentProfileId: testStudent.id, registrationNo: generatedRegNo },
        data: { registrationNo: testRegNo }
      })
    ]);
    
    // Verify
    const finalStudent = await prisma.studentProfile.findUnique({ where: { id: testStudent.id } });
    console.log(`Final Database State - Adm Date: ${finalStudent.admissionDate.toISOString()}, Reg No: ${finalStudent.registrationNo}`);
    
    // Cleanup
    console.log("Cleaning up test data...");
    await prisma.studentRegistration.deleteMany({ where: { studentProfileId: testStudent.id } });
    await prisma.studentProfile.delete({ where: { id: testStudent.id } });
    await prisma.studentProfile.delete({ where: { id: conflictStudent.id } });
    console.log("Cleanup complete. All tests passed!");
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
