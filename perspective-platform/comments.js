// comments.js

// Function to submit a new comment
document.getElementById('commentForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const commentText = document.getElementById('commentText').value;
  
    // Use the actual route for adding comments
    fetch('/add_comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commentText }),
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response or update the comments list if needed
        console.log(data);
  
        // Optionally, you can update the comments list here
        displayComments(data.comments);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
  
  function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
  
    comments.forEach(comment => {
      const li = document.createElement('li');
      li.textContent = comment.text;
  
      // Create upvote button
      const upvoteButton = document.createElement('button');
      upvoteButton.className = 'upvote-button';
      upvoteButton.textContent = 'Upvote';
      upvoteButton.addEventListener('click', () => upvoteComment(comment._id));
  
      // Create downvote button
      const downvoteButton = document.createElement('button');
      downvoteButton.className = 'downvote-button';
      downvoteButton.textContent = 'Downvote';
      downvoteButton.addEventListener('click', () => downvoteComment(comment._id));
  
      // Append buttons to the list item
      li.appendChild(upvoteButton);
      li.appendChild(downvoteButton);
  
      // Append the list item to the comments list
      commentsList.appendChild(li);
    });
  }
  

  
  
  // Function to upvote a comment
  function upvoteComment(commentId) {
    // Use the actual route for upvoting
    fetch(`/upvote_comment/${commentId}`, {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response or update the comments list if needed
        console.log(data);
  
        // Optionally, you can update the comments list here
        displayComments(data.comments);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  
  // Function to downvote a comment
  function downvoteComment(commentId) {
    // Use the actual route for downvoting
    fetch(`/downvote_comment/${commentId}`, {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response or update the comments list if needed
        console.log(data);
  
        // Optionally, you can update the comments list here
        displayComments(data.comments);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
// Route to add a new comment
app.post('/add_comment', async (req, res) => {
    try {
      const { commentText } = req.body;
  
      // Add your logic to save the comment to the database
      const comment = await Comment.create({ text: commentText });
      res.status(200).json({ comment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Route to upvote a comment
  app.post('/upvote_comment/:commentId', async (req, res) => {
    try {
      const { commentId } = req.params;
  
      // Add your logic to increment the upvotes of the comment in the database
      const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $inc: { upvotes: 1 } }, // Assuming you have an 'upvotes' field in your Comment schema
        { new: true }
      );
  
      res.status(200).json({ comment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Route to downvote a comment
  app.post('/downvote_comment/:commentId', async (req, res) => {
    try {
      const { commentId } = req.params;
  
      // Add your logic to decrement the downvotes of the comment in the database
      const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $inc: { downvotes: 1 } }, // Assuming you have a 'downvotes' field in your Comment schema
        { new: true }
      );
  
      res.status(200).json({ comment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  