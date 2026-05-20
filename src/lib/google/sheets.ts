import { google } from "googleapis";

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

/** Expected sheet layout (row 2 = headers): A=date, B=net_worth, C=cash, D=investments, E=debt, F=income, G=expenses */
export async function fetchFinanceFromSheet(
  refreshToken: string,
  spreadsheetId: string,
  range = "Sheet1!A2:G100"
) {
  const oauth2 = getOAuth2Client();
  oauth2.setCredentials({ refresh_token: refreshToken });
  const sheets = google.sheets({ version: "v4", auth: oauth2 });

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values ?? [];

  return rows
    .filter((row) => row[0])
    .map((row) => ({
      snapshot_date: String(row[0]),
      net_worth: parseFloat(row[1]) || null,
      cash_balance: parseFloat(row[2]) || null,
      investments: parseFloat(row[3]) || null,
      debt: parseFloat(row[4]) || null,
      monthly_income: parseFloat(row[5]) || null,
      monthly_expenses: parseFloat(row[6]) || null,
    }));
}
