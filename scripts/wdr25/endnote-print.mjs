import { readFile } from 'fs/promises';

async function formatEndnotes(jsonFilePath) {
  try {
    // Read the JSON file
    const data = await readFile(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(data);

    // Extract and format endnotes
    const formattedEndnotes = jsonData.endnotes
      .map((endnote) => {
        return `[^${endnote.n}]: ${endnote.text}`;
      })
      .join('\n\n');

    // Display the results
    console.log(formattedEndnotes);
  } catch (error) {
    console.error('Error reading or processing file:', error.message);
  }
}

// Usage: pass the path to your JSON file
const jsonFilePath = process.argv[2];
formatEndnotes(jsonFilePath);
