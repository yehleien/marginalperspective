let currentPage = 1;
const articlesPerPage = 5;
let selectedArticleId = null;

function fetchAndDisplayArticles() {
    fetch(`/get_news?page=${currentPage}&limit=${articlesPerPage}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateArticlesTable(data.articles);
            setupPagination(data.totalArticles);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function populateArticlesTable(articlesData) {
    const articlesTableBody = document.getElementById('articlesTableBody');
    articlesTableBody.innerHTML = '';

    articlesData.forEach(article => {
        const tr = document.createElement('tr');
        tr.id = `article-${article._id}`; // Assign an ID to each row for easy access


        const tdLink = document.createElement('td');
        const link = document.createElement('a');
        link.href = article.link;
        link.target = '_blank';
        link.textContent = article.link;
        tdLink.appendChild(link);

        const tdComments = document.createElement('td');
        tdComments.textContent = article.comments.length;

        const tdView = document.createElement('td');
        const viewButton = document.createElement('button');
        viewButton.textContent = 'Expand';
        viewButton.onclick = () => window.open(article.link, '_blank');
        tdView.appendChild(viewButton);

        const tdComment = document.createElement('td');
        const commentButton = document.createElement('button');
        commentButton.textContent = 'Comment';
        commentButton.onclick = () => selectArticleForComment(article._id, tr);
        tdComment.appendChild(commentButton);

        tr.appendChild(tdLink);
        tr.appendChild(tdComments);
        tr.appendChild(tdView);
        tr.appendChild(tdComment);

        articlesTableBody.appendChild(tr);
    });
}

function setupPagination(totalArticles) {
    const totalPages = Math.ceil(totalArticles / articlesPerPage);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => changePage(i);
        paginationContainer.appendChild(pageButton);
    }
}

function changePage(pageNumber) {
    currentPage = pageNumber;
    fetchAndDisplayArticles();
}

function selectArticleForComment(articleId, tr) {
    // Update the selected article ID
    selectedArticleId = articleId;

    // Highlight the selected row
    highlightRow(tr);

    // Fetch and display comments for the selected article
    fetchAndDisplayComments(articleId);
}

function highlightRow(rowElement) {
    // Remove highlight from all rows
    const rows = document.querySelectorAll('#articlesTableBody tr');
    rows.forEach(row => row.classList.remove('highlighted'));

    // Add highlight to the selected row
    rowElement.classList.add('highlighted');
}

function fetchAndDisplayComments(articleId) {
    fetch(`/get_comments/${articleId}`)
        .then(response => response.json())
        .then(data => {
            const commentsContainer = document.getElementById('commentsContainer');
            commentsContainer.innerHTML = ''; // Clear existing comments

            data.comments.forEach(comment => {
                // Create and append comment elements
                // ... existing code for creating comment elements ...
            });
        })
        .catch(error => console.error('Error:', error));
}

// Rest of your code remains the same


function highlightRow(rowElement) {
    // Remove highlight from all rows
    const rows = document.querySelectorAll('#articlesTableBody tr');
    rows.forEach(row => row.classList.remove('highlighted'));

    // Add highlight to the selected row
    rowElement.classList.add('highlighted');
}


function postComment() {
    const commentText = document.getElementById('commentInput').value;
    if (!commentText.trim()) {
        alert('Please enter a comment.');
        return;
    }

    fetch('/post_comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId: selectedArticleId, commentText }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        fetchAndDisplayArticles(); // Refresh articles to update comment count
    })
    .catch(error => console.error('Error posting comment:', error));
}

function fetchAndDisplayComments(articleId) {
    fetch(`/get_comments/${articleId}`)
        .then(response => response.json())
        .then(data => {
            const commentsContainer = document.getElementById('commentsContainer');
            commentsContainer.innerHTML = ''; // Clear existing comments

            data.comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment');

                // Comment text
                const commentText = document.createElement('p');
                commentText.textContent = comment.text;
                commentElement.appendChild(commentText);

                // Votes display
                const votesDiv = document.createElement('div');
                votesDiv.classList.add('votes');

                // Upvote button
                const upvoteButton = document.createElement('button');
                upvoteButton.textContent = `Upvote (${comment.upvotes})`;
                upvoteButton.classList.add('upvote-button');
                upvoteButton.onclick = () => toggleVote(comment._id, 'upvote');
                votesDiv.appendChild(upvoteButton);

                // Downvote button
                const downvoteButton = document.createElement('button');
                downvoteButton.textContent = `Downvote (${comment.downvotes})`; // Display downvotes as negative
                downvoteButton.classList.add('downvote-button');
                downvoteButton.onclick = () => toggleVote(comment._id, 'downvote');
                votesDiv.appendChild(downvoteButton);

                commentElement.appendChild(votesDiv);
                commentsContainer.appendChild(commentElement);
            });
        })
        .catch(error => console.error('Error:', error));
}




function toggleVote(commentId, voteType) {
    fetch('/toggle_vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId, voteType }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Vote updated:', data);
        // Refresh the comments to show the updated vote counts
        if (selectedArticleId) {
            fetchAndDisplayComments(selectedArticleId);
        }
    })
    .catch(error => console.error('Error:', error));
}


// Ensure the DOM is fully loaded before executing
document.addEventListener('DOMContentLoaded', fetchAndDisplayArticles);
