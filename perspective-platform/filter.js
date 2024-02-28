document.getElementById('randomArticleButton').addEventListener('click', async function() {
    try {
        // Fetch a random article from the server
        const response = await fetch('/articles/random');
        const article = await response.json();

        // Display the article
        displayArticle(article);
    } catch (error) {
        console.error('Error fetching random article:', error);
    }
});