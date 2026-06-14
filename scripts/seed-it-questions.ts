import { MongoClient } from "mongodb";

const rawUri = process.env.MONGODB_URI ?? process.env.DATABASE_URL;
if (!rawUri) {
  throw new Error("MONGODB_URI or DATABASE_URL must be set");
}
const databaseName = process.env.MONGODB_DB ?? "admission_system";

async function main() {
  const client = new MongoClient(rawUri as string);
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db(databaseName);
    
    const questionsCollection = db.collection("questions");
    const testsCollection = db.collection("tests");

    // Static set of 50 IT questions (Word, Excel, PowerPoint) - 35 Basic (70%), 15 Advanced (30%)
    const questionsData = [
      // Basic Word (12)
      { text: "What is the shortcut key to save a document in MS Word?", options: ["Ctrl + S", "Ctrl + P", "Ctrl + N", "Ctrl + O"], correctAnswer: "Ctrl + S", subject: "MS Word", difficulty: "easy" },
      { text: "Which tab is used to change the page margins in MS Word?", options: ["Home", "Insert", "Page Layout", "View"], correctAnswer: "Page Layout", subject: "MS Word", difficulty: "easy" },
      { text: "What is the default file extension for MS Word 2007 and later?", options: [".doc", ".txt", ".docx", ".pdf"], correctAnswer: ".docx", subject: "MS Word", difficulty: "easy" },
      { text: "Which shortcut key is used to bold text in MS Word?", options: ["Ctrl + B", "Ctrl + I", "Ctrl + U", "Ctrl + E"], correctAnswer: "Ctrl + B", subject: "MS Word", difficulty: "easy" },
      { text: "What feature is used to check spelling and grammar?", options: ["Find", "Replace", "Spelling & Grammar", "Research"], correctAnswer: "Spelling & Grammar", subject: "MS Word", difficulty: "easy" },
      { text: "What is the shortcut key for copying text?", options: ["Ctrl + C", "Ctrl + X", "Ctrl + V", "Ctrl + Z"], correctAnswer: "Ctrl + C", subject: "MS Word", difficulty: "easy" },
      { text: "Which of the following is not a font style?", options: ["Bold", "Italic", "Regular", "Superscript"], correctAnswer: "Superscript", subject: "MS Word", difficulty: "easy" },
      { text: "How can you select the entire document in MS Word?", options: ["Ctrl + A", "Ctrl + E", "Ctrl + M", "Ctrl + Shift + A"], correctAnswer: "Ctrl + A", subject: "MS Word", difficulty: "easy" },
      { text: "What does 'Ctrl + Z' do in MS Word?", options: ["Undo", "Redo", "Paste", "Cut"], correctAnswer: "Undo", subject: "MS Word", difficulty: "easy" },
      { text: "Which tool is used to copy formatting from one place and apply it to another?", options: ["Format Painter", "Copy", "Cut", "Paste Special"], correctAnswer: "Format Painter", subject: "MS Word", difficulty: "easy" },
      { text: "What is a 'Header' in MS Word?", options: ["Text at the top of a page", "Text at the bottom of a page", "The title of the document", "A type of font"], correctAnswer: "Text at the top of a page", subject: "MS Word", difficulty: "easy" },
      { text: "Which shortcut key opens the 'Print' dialog box?", options: ["Ctrl + P", "Ctrl + Shift + P", "Alt + P", "Shift + P"], correctAnswer: "Ctrl + P", subject: "MS Word", difficulty: "easy" },
      
      // Basic Excel (12)
      { text: "What is a collection of worksheets called?", options: ["Workbook", "Workspace", "File", "Database"], correctAnswer: "Workbook", subject: "MS Excel", difficulty: "easy" },
      { text: "Which symbol must every formula in Excel begin with?", options: ["+", "-", "=", "*"], correctAnswer: "=", subject: "MS Excel", difficulty: "easy" },
      { text: "What is the intersection of a row and a column called?", options: ["Box", "Cell", "Block", "Grid"], correctAnswer: "Cell", subject: "MS Excel", difficulty: "easy" },
      { text: "Which function calculates the sum of a range of cells?", options: ["TOTAL()", "SUM()", "ADD()", "CALC()"], correctAnswer: "SUM()", subject: "MS Excel", difficulty: "easy" },
      { text: "What is the default file extension for an Excel 2007+ workbook?", options: [".xls", ".xlsx", ".xlsm", ".csv"], correctAnswer: ".xlsx", subject: "MS Excel", difficulty: "easy" },
      { text: "Which feature allows you to combine multiple cells into one?", options: ["Wrap Text", "Merge & Center", "Split Cells", "Join Cells"], correctAnswer: "Merge & Center", subject: "MS Excel", difficulty: "easy" },
      { text: "How are columns labeled in an Excel worksheet?", options: ["Numbers (1, 2, 3...)", "Letters (A, B, C...)", "Roman Numerals", "Symbols"], correctAnswer: "Letters (A, B, C...)", subject: "MS Excel", difficulty: "easy" },
      { text: "What does the 'AVERAGE()' function do?", options: ["Finds the middle value", "Calculates the arithmetic mean", "Finds the highest value", "Counts the cells"], correctAnswer: "Calculates the arithmetic mean", subject: "MS Excel", difficulty: "easy" },
      { text: "Which key is used to edit the contents of a cell?", options: ["F2", "F4", "F5", "Enter"], correctAnswer: "F2", subject: "MS Excel", difficulty: "easy" },
      { text: "What is a 'Range' in Excel?", options: ["A single cell", "A group of selected cells", "A mathematical formula", "A chart type"], correctAnswer: "A group of selected cells", subject: "MS Excel", difficulty: "easy" },
      { text: "Which tool allows you to automatically fill a series of data (like months or days)?", options: ["AutoSum", "AutoFill", "AutoCorrect", "AutoFormat"], correctAnswer: "AutoFill", subject: "MS Excel", difficulty: "easy" },
      { text: "How do you select an entire column in Excel?", options: ["Click the column heading letter", "Click any cell in the column", "Press Ctrl + C", "Press Shift + Space"], correctAnswer: "Click the column heading letter", subject: "MS Excel", difficulty: "easy" },

      // Basic PowerPoint (11)
      { text: "What is an individual page in a PowerPoint presentation called?", options: ["Document", "Worksheet", "Slide", "Card"], correctAnswer: "Slide", subject: "MS PowerPoint", difficulty: "easy" },
      { text: "Which shortcut key is used to start a presentation from the beginning?", options: ["F5", "Shift + F5", "Ctrl + P", "Alt + Enter"], correctAnswer: "F5", subject: "MS PowerPoint", difficulty: "easy" },
      { text: "What is the default file extension for PowerPoint 2007+ files?", options: [".ppt", ".pptx", ".pps", ".pdf"], correctAnswer: ".pptx", subject: "MS PowerPoint", difficulty: "easy" },
      { text: "Which feature adds motion effects to individual objects on a slide?", options: ["Transitions", "Animations", "Design", "Slide Show"], correctAnswer: "Animations", subject: "MS PowerPoint", difficulty: "easy" },
      { text: "Which shortcut key is used to add a new slide?", options: ["Ctrl + N", "Ctrl + M", "Ctrl + S", "Alt + N"], correctAnswer: "Ctrl + M", subject: "MS PowerPoint", difficulty: "easy" },
      { text: "What is the purpose of 'Slide Transitions'?", options: ["To add sound to objects", "To move objects on a slide", "To apply effects when moving from one slide to another", "To format text"], correctAnswer: "To apply effects when moving from one slide to another", subject: "MS PowerPoint", difficulty: "easy" },
      { text: "Which view is best for sorting and rearranging slides?", options: ["Normal View", "Slide Sorter View", "Reading View", "Slide Show View"], correctAnswer: "Slide Sorter View", subject: "MS PowerPoint", difficulty: "easy" },
      { text: "What are the predefined layouts in PowerPoint called?", options: ["Designs", "Templates", "Slide Layouts", "Themes"], correctAnswer: "Slide Layouts", subject: "MS PowerPoint", difficulty: "easy" },
      { text: "Which tab is used to insert a picture or shape?", options: ["Home", "Insert", "Design", "Animations"], correctAnswer: "Insert", subject: "MS PowerPoint", difficulty: "easy" },
      { text: "What is the 'Notes Pane' used for?", options: ["Adding comments for the audience", "Adding speaker notes that the audience doesn't see", "Writing the presentation outline", "Formatting text"], correctAnswer: "Adding speaker notes that the audience doesn't see", subject: "MS PowerPoint", difficulty: "easy" },
      { text: "Which shortcut key is used to exit a running Slide Show?", options: ["Enter", "Spacebar", "Esc", "Shift"], correctAnswer: "Esc", subject: "MS PowerPoint", difficulty: "easy" },

      // Advanced Word (5)
      { text: "What is the purpose of 'Mail Merge' in MS Word?", options: ["Combining multiple documents", "Sending a document via email", "Creating multiple documents like letters or labels from a single template and a data source", "Merging cells in a table"], correctAnswer: "Creating multiple documents like letters or labels from a single template and a data source", subject: "MS Word", difficulty: "hard" },
      { text: "Which feature is used to automatically generate a Table of Contents?", options: ["Index", "Bookmarks", "Styles (Heading 1, Heading 2)", "Cross-reference"], correctAnswer: "Styles (Heading 1, Heading 2)", subject: "MS Word", difficulty: "hard" },
      { text: "What is a 'Macro' in MS Word?", options: ["A large font size", "A recorded sequence of commands to automate a task", "A type of chart", "A predefined template"], correctAnswer: "A recorded sequence of commands to automate a task", subject: "MS Word", difficulty: "hard" },
      { text: "How do you insert a hard page break?", options: ["Enter", "Shift + Enter", "Ctrl + Enter", "Alt + Enter"], correctAnswer: "Ctrl + Enter", subject: "MS Word", difficulty: "hard" },
      { text: "What is 'Track Changes' used for?", options: ["Tracking the time spent on a document", "Keeping a record of all edits made to a document", "Changing the file path", "Tracking document versions"], correctAnswer: "Keeping a record of all edits made to a document", subject: "MS Word", difficulty: "hard" },

      // Advanced Excel (5)
      { text: "What does the VLOOKUP function do?", options: ["Searches for a value in the first row of a table", "Searches for a value in the first column of a table array and returns a value in the same row", "Calculates the variance", "Looks up visual elements"], correctAnswer: "Searches for a value in the first column of a table array and returns a value in the same row", subject: "MS Excel", difficulty: "hard" },
      { text: "What is a 'PivotTable' used for?", options: ["Creating 3D charts", "Pivoting the screen orientation", "Summarizing, analyzing, and exploring large amounts of data", "Protecting a worksheet"], correctAnswer: "Summarizing, analyzing, and exploring large amounts of data", subject: "MS Excel", difficulty: "hard" },
      { text: "What symbol is used to create an absolute cell reference (e.g., $A$1)?", options: ["#", "@", "$", "&"], correctAnswer: "$", subject: "MS Excel", difficulty: "hard" },
      { text: "What is 'Conditional Formatting'?", options: ["Formatting text based on its length", "Applying formatting rules based on specific cell values or conditions", "Formatting cells using a macro", "Protecting specific cells"], correctAnswer: "Applying formatting rules based on specific cell values or conditions", subject: "MS Excel", difficulty: "hard" },
      { text: "Which function counts the number of cells that meet a single specific criterion?", options: ["COUNT()", "COUNTA()", "COUNTIF()", "COUNTIFS()"], correctAnswer: "COUNTIF()", subject: "MS Excel", difficulty: "hard" },

      // Advanced PowerPoint (5)
      { text: "What is the 'Slide Master' used for?", options: ["To control the global formatting and layout of all slides in a presentation", "To view all slides as thumbnails", "To present the slide show to the master audience", "To lock the presentation"], correctAnswer: "To control the global formatting and layout of all slides in a presentation", subject: "MS PowerPoint", difficulty: "hard" },
      { text: "How can you embed a video so it plays automatically when a slide appears?", options: ["Insert > Video > Set playback options to 'Automatically'", "Use a hyperlink", "Add an animation to the text", "It's not possible"], correctAnswer: "Insert > Video > Set playback options to 'Automatically'", subject: "MS PowerPoint", difficulty: "hard" },
      { text: "What is 'Presenter View'?", options: ["A view that shows the audience notes", "A dual-screen view showing the current slide to the audience and notes/next slide to the presenter", "A view for printing handouts", "A view for editing the master slide"], correctAnswer: "A dual-screen view showing the current slide to the audience and notes/next slide to the presenter", subject: "MS PowerPoint", difficulty: "hard" },
      { text: "Which feature allows you to record your narration and timings for a presentation?", options: ["Rehearse Timings", "Record Slide Show", "Macro Recorder", "Audio Notes"], correctAnswer: "Record Slide Show", subject: "MS PowerPoint", difficulty: "hard" },
      { text: "How do you create a custom show (a subset of slides) within a larger presentation?", options: ["Delete the unwanted slides", "Hide the unwanted slides", "Use Slide Show > Custom Slide Show", "Save as a new file"], correctAnswer: "Use Slide Show > Custom Slide Show", subject: "MS PowerPoint", difficulty: "hard" }
    ];

    const formattedQuestions = questionsData.map(q => ({
      ...q,
      category: "IT Knowledge",
      type: "mcq",
      tags: ["IT", q.subject],
      marks: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const insertResult = await questionsCollection.insertMany(formattedQuestions);
    console.log(`Inserted ${insertResult.insertedCount} questions.`);
    
    const questionIds = Object.values(insertResult.insertedIds).map(id => id.toString());

    // Create or update the Active Test
    // Let's see if an active test exists
    const activeTest = await testsCollection.findOne({ status: "published", isActive: true });
    
    if (activeTest) {
      console.log(`Found active test: ${activeTest.title}. Updating with new questions.`);
      await testsCollection.updateOne(
        { _id: activeTest._id },
        { 
          $set: { 
            questionIds: questionIds,
            totalMarks: questionIds.length * 2,
            durationMinutes: 45,
            passingMarks: 50,
            updatedAt: new Date()
          } 
        }
      );
    } else {
      console.log(`No active test found. Creating a new one.`);
      const newTest = {
        title: "Standard IT Evaluation Test",
        description: "Contains 50 static questions on MS Word, Excel, and PowerPoint.",
        status: "published",
        isActive: true,
        durationMinutes: 45,
        totalMarks: questionIds.length * 2,
        passingMarks: 50,
        negativeMarking: false,
        negativeMarksPerWrong: 0,
        randomizeQuestions: false,
        randomizeOptions: false,
        questionIds: questionIds,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await testsCollection.insertOne(newTest);
    }

    console.log("Seeding complete!");

  } catch (err) {
    console.error("Error seeding questions:", err);
  } finally {
    await client.close();
  }
}

main();
