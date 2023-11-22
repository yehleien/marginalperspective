// Function to add a comment
function addComment() {
    const commentText = document.getElementById('commentText').value;

    fetch('/add_comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: commentText,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response or update the comments list
        console.log(data);

        // Clear the comment textarea
        document.getElementById('commentText').value = '';

        // Fetch and display comments again to show the new comment
        fetchAndDisplayComments();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to submit a link
function submitLink() {
    const articleLink = document.getElementById('articleLink').value;

    fetch('/submit_link', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            link: articleLink,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response or update the links list
        console.log(data);

        // Clear the link input field
        document.getElementById('articleLink').value = '';

        // Fetch and display articles again to show the new link
        fetchAndDisplayArticles();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to fetch and display comments
function fetchAndDisplayComments() {
    fetch('/get_comments')
    .then(response => response.json())
    .then(data => {
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = ''; // Clear existing comments

        data.comments.forEach(comment => {
            const li = document.createElement('li');
            li.className = 'comment-item';
            li.innerHTML = `
                <div class="comment-text">${comment.text}</div>
                <div class="comment-votes">
                    <span class="upvotes">Upvotes: ${comment.upvotes}</span>
                    <span class="downvotes">Downvotes: ${comment.downvotes}</span>
                </div>
            `;
            commentsList.appendChild(li);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Initial fetch and display comments
fetchAndDisplayComments();

// Function to fetch and display articles with comments
function fetchAndDisplayArticles() {
    fetch('/get_articles')
    .then(response => response.json())
    .then(data => {
        const articlesTableBody = document.getElementById('articlesTableBody');
        articlesTableBody.innerHTML = ''; // Clear existing articles

        data.articles.forEach(article => {
            const tr = document.createElement('tr');
            const tdLink = document.createElement('td');
            const tdComments = document.createElement('td');

            tdLink.innerHTML = `<a href="${article.link}" target="_blank">${article.title}</a>`;
            tdComments.textContent = article.commentsCount;

            tr.appendChild(tdLink);
            tr.appendChild(tdComments);

            articlesTableBody.appendChild(tr);
        });

        // Add the view button functionality
        addViewButtonFunctionality();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Initial fetch and display articles
fetchAndDisplayArticles();

// Function to add functionality to the "View" button
function addViewButtonFunctionality() {
    const viewButtons = document.querySelectorAll('button[data-article-link]');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const articleLink = this.getAttribute('data-article-link');
            viewArticle(articleLink, event);
        });
    });
}

// Function to view an article and associated comments
function viewArticle(articleLink, event) {
    event.preventDefault();

    const articleFrame = document.getElementById('articleFrame');
    articleFrame.src = articleLink;

    fetchCommentsForArticle(articleLink);
}

// Function to fetch and display comments associated with an article
function fetchCommentsForArticle(articleLink) {
    // Fetch comments associated with the article using the actual route
    fetch('/get_comments_for_article', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            articleLink: articleLink,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Display comments associated with the article
        displayComments(data.comments);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to display comments
function displayComments(comments) {
    // Update the comments display with the fetched comments
    const commentsSection = document.getElementById('commentsSection');
    commentsSection.innerHTML = '';

    comments.forEach(comment => {
        const li = document.createElement('li');
        li.textContent = comment.text;
        commentsSection.appendChild(li);
    });
}

// Function to fetch article data from the server
function fetchArticleData() {
    fetch('/get_articles_data')
        .then(response => response.json())
        .then(data => {
            // Call a function to populate the articles table with the fetched data
            populateArticlesTable(data.articles);
        })
        .catch(error => {
            console.error('Error fetching article data:', error);
        });
}

// Function to populate the articles table with fetched data
function populateArticlesTable(articlesData) {
    const articlesTableBody = document.getElementById('articlesTableBody');

    articlesData.forEach((article, index) => {
        const tr = document.createElement('tr');

        const tdLink = document.createElement('td');
        const link = document.createElement('a');
        link.href = article.link;
        link.target = '_blank';
        link.textContent = `Article ${index + 1}`;
        tdLink.appendChild(link);

        const tdComments = document.createElement('td');
        tdComments.textContent = article.comments;

        const tdView = document.createElement('td');
        const viewButton = document.createElement('button');
        viewButton.type = 'button';
        viewButton.textContent = 'View';
        viewButton.addEventListener('click', () => viewArticle(article.link));
        tdView.appendChild(viewButton);

        tr.appendChild(tdLink);
        tr.appendChild(tdComments);
        tr.appendChild(tdView);

        articlesTableBody.appendChild(tr);
    });
}

// Fetch and populate the articles table with data on page load
window.addEventListener('load', fetchArticleData);
