require('dotenv').config({ path: 'C:/Users/CHA/.gemini/antigravity/scratch/easyxl-gg/.env' });

async function listModels() {
    try {
        const key = process.env.VITE_GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        
        if (data.models) {
            const resultList = data.models.map(m => ({
                name: m.name,
                displayName: m.displayName,
                description: m.description
            }));
            console.log(JSON.stringify(resultList, null, 2));
        } else {
            console.log('Error fetching models:', data);
        }
    } catch (err) {
        console.error('Fetch exception:', err.message);
    }
}

listModels();
