/**
 * Google Sheets API 통합 서비스
 * Auth에서 발급받은 provider_token을 사용하여 사용자의 구글 드라이브에 시트를 생성하고 데이터를 삽입합니다.
 */

interface GoogleSheetResponse {
    spreadsheetId: string;
    spreadsheetUrl: string;
}

export const exportToGoogleSheets = async (
    providerToken: string,
    sheetName: string,
    data: any[][]
): Promise<GoogleSheetResponse> => {
    // 1. 구글 스프레드시트 생성
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${providerToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            properties: {
                title: `EasyXL Export - ${sheetName} - ${new Date().toLocaleDateString()}`,
            },
        }),
    });

    if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error?.message || '스프레드시트 생성에 실패했습니다.');
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = sheetData.spreadsheetUrl;
    
    // 구글 API는 A1만 넘길 경우 내부적으로 Sheet1!A1으로 파싱을 시도합니다.
    // 한국어 환경에서는 기본 시트가 '시트1'이므로 에러가 발생합니다.
    // 생성된 시트의 실제 이름을 가져와서 명시적으로 지정하고 URL 인코딩을 적용합니다.
    const firstSheetTitle = sheetData.sheets?.[0]?.properties?.title || 'Sheet1';
    const encodedRange = encodeURIComponent(`'${firstSheetTitle}'!A1`);

    // 2. 생성된 시트에 데이터 삽입
    const updateRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED`,
        {
            method: 'POST', // append requires POST
            headers: {
                'Authorization': `Bearer ${providerToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: data,
            }),
        }
    );

    if (!updateRes.ok) {
        const err = await updateRes.json();
        throw new Error(err.error?.message || '스프레드시트에 데이터를 쓰는 데 실패했습니다.');
    }

    return {
        spreadsheetId,
        spreadsheetUrl,
    };
};
