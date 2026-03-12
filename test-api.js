import axios from 'axios';

const key = 'AIzaSyCLH8QmPtd3qoywsq5gOGAHsi-n7i5f_ic';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

async function test() {
    console.log('Testing Gemini API Key...');
    try {
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: 'Hello, are you working?' }] }]
        });
        console.log('SUCCESS!');
        console.log('Response:', JSON.stringify(res.data.candidates[0].content.parts[0].text));
    } catch (err) {
        console.error('FAILED!');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data));
        } else {
            console.error('Error:', err.message);
        }
    }
}

test();
