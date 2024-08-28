// Replace with your Unsplash Access Key
const ACCESS_KEY = 'Pbg4PIDG1sPSM2LEkl5EtYIgkWRnBjkIhkIJ0D0vQ1o';

async function getFirstImageUrl(searchTerm) {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=1`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Client-ID ${ACCESS_KEY}`
        }
    });

    const data = await response.json();

    if (response.ok && data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
    } else {
        return null;
    }
}

// Example usage
getFirstImageUrl('rooster').then(url => {
    if (url) {
        console.log(`First image URL: ${url}`);
    } else {
        console.log('No image found.');
    }
});
