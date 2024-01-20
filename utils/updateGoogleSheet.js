const { google } = require('googleapis');
const sheets = google.sheets('v4');

const updateGoogleSheet = async (spreadsheetId, attendanceMap) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: '../gcloud_credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();

  const sheetValues = [['Roll No', ...Array.from(attendanceMap.values())[0].dates]];
  Array.from(attendanceMap.entries()).forEach(([key, value]) => {
    const [rollNo, date] = key.split('_');
    const row = [rollNo, ...(value.dates.map(time => value[time] || 'absent'))];
    sheetValues.push(row);
  });

  await sheets.spreadsheets.values.update({
    auth: client,
    spreadsheetId: spreadsheetId,
    range: 'Sheet1',
    valueInputOption: 'RAW',
    resource: {
      values: sheetValues,
    },
  });

  return spreadsheetId;
};

module.exports = updateGoogleSheet;