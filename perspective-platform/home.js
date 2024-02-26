let currentPage = 1;
const articlesPerPage = 10;
let selectedArticleId = null;

window.onload = async function() {
    console.log('Page loaded');
    await fetchAndDisplayArticles(); // Call the function here

    // Event listener for the perspectives select box
    document.getElementById('perspectiveSelect').addEventListener('change', function(event) {
        perspectiveId = parseInt(event.target.value, 10);
        console.log('Selected perspective ID:', perspectiveId); // Log the selected perspective ID
    });
};

document.getElementById('scrapeArticles').addEventListener('click', async function(event) {
    try {
        const response = await fetch('/articles/scrape_and_submit_articles');
        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error:', error);
    }
});

async function fetchAndDisplayArticles() {
    try {
        const response = await fetch('/articles/get_news');
        const articles = await response.json();
        const articlesBody = document.getElementById('articlesBody');
        articlesBody.innerHTML = ''; // Clear the table body

        for (const article of articles) {
            const row = document.createElement('tr');
            const titleCell = document.createElement('td');
            const dateCell = document.createElement('td');
            const actionCell = document.createElement('td');
            const sourceCell = document.createElement('td');
            const commentsCountCell = document.createElement('td');
            const mostCommonPerspectiveCell = document.createElement('td');
            const totalVotesCell = document.createElement('td');
            const viewInFocusCell = document.createElement('td'); // Placeholder for future implementation

            titleCell.textContent = article.title;
            dateCell.textContent = new Date(article.submitDate).toLocaleDateString();

            const actionButton = document.createElement('button');
            actionButton.textContent = 'View Article';
            actionButton.addEventListener('click', async () => {
                // Placeholder for action
            });
            actionCell.appendChild(actionButton);

            const url = new URL(article.url);
            sourceCell.textContent = url.hostname;

            // Use existing functionality to get comments count
            const commentsResponse = await fetch(`/comments/comments/${article.id}`);
            const comments = await commentsResponse.json();
            commentsCountCell.textContent = comments.length;

            // Calculate total votes
            let totalVotes = 0;
            comments.forEach(comment => {
                // Assuming each comment has a 'votes' array
                totalVotes += comment.votes.length;
            });
            totalVotesCell.textContent = totalVotes;

            // Determine the most common perspective
            let perspectiveTally = {};
            comments.forEach(comment => {
                if (comment.Perspective && comment.Perspective.perspectiveName) {
                    const perspectiveName = comment.Perspective.perspectiveName;
                    if (!perspectiveTally[perspectiveName]) {
                        perspectiveTally[perspectiveName] = 1;
                    } else {
                        perspectiveTally[perspectiveName]++;
                    }
                }
            });

            let mostCommonPerspective = '';
            let maxCount = 0;
            for (let perspective in perspectiveTally) {
                if (perspectiveTally[perspective] > maxCount) {
                    mostCommonPerspective = perspective;
                    maxCount = perspectiveTally[perspective];
                }
            }
            mostCommonPerspectiveCell.textContent = mostCommonPerspective || 'None';

            const viewInFocusButton = document.createElement('button');
            viewInFocusButton.textContent = 'View in Focus'; // Placeholder for future implementation
            viewInFocusCell.appendChild(viewInFocusButton); // Placeholder for future implementation

            row.appendChild(titleCell);
            row.appendChild(dateCell);
            row.appendChild(actionCell);
            row.appendChild(sourceCell);
            row.appendChild(commentsCountCell);
            row.appendChild(mostCommonPerspectiveCell);
            row.appendChild(totalVotesCell);
            row.appendChild(viewInFocusCell);

            articlesBody.appendChild(row);
        }
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('articleForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const urlInput = event.target.elements.articleUrl;
    const url = urlInput.value;
    await submitArticle(url);
    urlInput.value = ''; // Clear the input field
    await fetchAndDisplayArticles(); // Refresh the articles list
});
