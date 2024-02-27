document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('submitLinkForm');
    const urlInput = document.getElementById('linkUrl');
    const typeSelect = document.getElementById('linkType');

    urlInput.addEventListener('input', function() {
        const url = urlInput.value.toLowerCase();
        if (url.includes("youtube.com") || url.includes("vimeo.com")) {
            typeSelect.value = "video";
        } else if (url.includes("medium.com") || url.includes("blogger.com")) {
            typeSelect.value = "blog";
        } else if (url.includes("arxiv.org") || url.includes("jstor.org")) {
            typeSelect.value = "scholarly";
        } else if (url.includes("nytimes.com") || url.includes("theguardian.com")) {
            typeSelect.value = "article";
        } else {
            typeSelect.value = "webpage"; // Default to webpage
        }
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const linkUrl = urlInput.value;
        const linkType = typeSelect.value;
        try {
            const response = await fetch('/articles/submit_article', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: linkUrl, type: linkType }),
            });
            if (response.ok) {
                alert('Link submitted successfully.');
                form.reset();
            } else {
                alert('Failed to submit article.');
            }
        } catch (error) {
            console.error('Error submitting article:', error);
            alert('Error submitting article.');
        }
    });
});