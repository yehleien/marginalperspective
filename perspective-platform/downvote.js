// perspective-platform/downvote.js
export default async function downvote(comment, upvoteButton, downvoteButton) {
    if (!comment.userHasDownvoted) {
        try {
            const response = await fetch(`/comments/downvote/${comment.id}`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                upvoteButton.innerHTML = `&#x25B2; (${data.upvotes})`;
                downvoteButton.innerHTML = `&#x25BC; (${data.downvotes})`;
                if (downvoteButton.classList.contains('downvoted')) {
                  downvoteButton.classList.remove('downvoted');
                } else {
                  downvoteButton.classList.add('downvoted');
                  upvoteButton.classList.remove('upvoted');
                }
              }
        } catch (error) {
            console.error('Error downvoting comment:', error);
        }
    }
}
