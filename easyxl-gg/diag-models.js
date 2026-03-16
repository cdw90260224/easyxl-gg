import axios from 'axios';

const key = 'AIzaSyCLH8QmPtd3qoywsq5gOGAHsi-n7i5f_ic';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function listModels() {
    console.log('--- Diagnosis: Available Models ---');
    try {
        const res = await axios.get(url);
        const models = res.data.models;
        console.log('Successfully retrieved model list.');
        console.log('Available Flash models:');
        models.filter(m => m.name.includes('flash')).forEach(m => {
            console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
        });
    } catch (err) {
        console.error('FAILED to list models!');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data));
        } else {
            console.error('Error:', err.message);
        }
    }
}

listModels();
