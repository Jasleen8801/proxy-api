const { google } = require('googleapis');
const sheets = google.sheets('v4');

const createGoogleSheet = async (title) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: '../gcloud_credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();

    const createSheetResponse = await sheets.spreadsheets.create({
      auth: client,
      resource: {
        properties: {
          title: title,
        },
      },
    });
    
    const spreadsheetId = createSheetResponse.data.spreadsheetId;
    return spreadsheetId;
  } catch (error) {
    console.log(error);
  }
}

module.exports = createGoogleSheet;