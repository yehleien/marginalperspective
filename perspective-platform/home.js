let currentPage = 1;
const articlesPerPage = 25; // Updated to show 25 articles per page
let selectedArticleId = null;
let articles = []; // This will hold all fetched articles

window.onload = async function() {
    console.log('Page loaded');
    await fetchAllArticles(); // Fetch all articles once and store them
    displayArticles(); // Display the first page of articles

    // Event listener for the perspectives select box
    document.getElementById('perspectiveSelect').addEventListener('change', function(event) {
        perspectiveId = parseInt(event.target.value, 10);
        console.log('Selected perspective ID:', perspectiveId); // Log the selected perspective ID
    });

    document.getElementById('nextPageButton').addEventListener('click', nextPage);
    document.getElementById('prevPageButton').addEventListener('click', previousPage);
};


async function fetchAllArticles() {
    try {
        const response = await fetch('/articles/get_news');
        articles = await response.json(); // Assuming this fetches all articles as an array
        console.log('Fetched articles:', articles.length);
    } catch (error) {
        console.error('Error fetching articles:', error);
    }
}

function displayArticles() {
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const articlesToDisplay = articles.slice(startIndex, endIndex);

    const articlesBody = document.getElementById('articlesBody');
    articlesBody.innerHTML = ''; // Clear the table body

    articlesToDisplay.forEach(async (article) => { // Marked as async
        const row = document.createElement('tr');
        const titleCell = document.createElement('td');
        const dateCell = document.createElement('td');
        const typeCell = document.createElement('td'); // Add this line
        const actionCell = document.createElement('td');
        const sourceCell = document.createElement('td');
        const commentsCountCell = document.createElement('td');
        const mostCommonPerspectiveCell = document.createElement('td');
        const totalVotesCell = document.createElement('td');
        const viewInFocusCell = document.createElement('td');

        titleCell.textContent = article.title;
        dateCell.textContent = new Date(article.submitDate).toLocaleDateString();
        typeCell.textContent = article.type; // Add this line


        const actionButton = document.createElement('button');
        actionButton.textContent = 'View Article';
        actionButton.addEventListener('click', () => {
            window.open(article.url, '_blank');
        });
        actionCell.appendChild(actionButton);

        const url = new URL(article.url);
        sourceCell.textContent = url.hostname;

        let comments = [];
        try {
            const commentsResponse = await fetch(`/comments/comments/${article.id}`);
            comments = await commentsResponse.json();
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
        commentsCountCell.textContent = comments.length;

        let totalVotes = 0;
        comments.forEach(comment => {
            totalVotes += comment.votes.length;
        });
        totalVotesCell.textContent = totalVotes;

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
        viewInFocusButton.textContent = 'View in Focus';
        viewInFocusButton.addEventListener('click', () => {
            window.location.href = `/focus?articleId=${article.id}`;
        });
        viewInFocusCell.appendChild(viewInFocusButton);

        row.appendChild(titleCell);
        row.appendChild(dateCell);
        row.appendChild(typeCell); // This line was added to include the type cell in the row
        row.appendChild(actionCell);
        row.appendChild(sourceCell); 
        row.appendChild(commentsCountCell);
        row.appendChild(mostCommonPerspectiveCell);
        row.appendChild(totalVotesCell);
        row.appendChild(viewInFocusCell);

        articlesBody.appendChild(row);
    });

    // Update pagination buttons visibility
    updatePaginationButtons();
}

function updatePaginationButtons() {
    const totalPages = Math.ceil(articles.length / articlesPerPage);
    document.getElementById('prevPageButton').style.display = currentPage > 1 ? 'block' : 'none';
    document.getElementById('nextPageButton').style.display = currentPage < totalPages ? 'block' : 'none';
}

function nextPage() {
    if (currentPage < Math.ceil(articles.length / articlesPerPage)) {
        currentPage++;
        displayArticles();
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayArticles();
    }
}

document.getElementById('articleForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const urlInput = event.target.elements.articleUrl;
    const url = urlInput.value;
    await submitArticle(url);
    urlInput.value = ''; // Clear the input field
    await fetchAllArticles(); // Refresh the articles list
});

document.getElementById('nextPageButton').addEventListener('click', nextPage);
document.getElementById('prevPageButton').addEventListener('click', previousPage);