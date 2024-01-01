// upvote.js
export default async function upvote(comment, upvoteButton, downvoteButton) {
    if (!comment.userHasUpvoted) {
        try {
            const response = await fetch(`/comments/upvote/${comment.id}`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                upvoteButton.innerHTML = `&#x25B2; (${data.upvotes})`;
                downvoteButton.innerHTML = `&#x25BC; (${data.downvotes})`;
                if (upvoteButton.classList.contains('upvoted')) {
                  upvoteButton.classList.remove('upvoted');
                } else {
                  upvoteButton.classList.add('upvoted');
                  downvoteButton.classList.remove('downvoted');
                }
            }
        } catch (error) {
            console.error('Error upvoting comment:', error);
        }
    }
}
