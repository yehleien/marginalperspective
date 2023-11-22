document.addEventListener('DOMContentLoaded', function() {
    fetchPerspectives();
});

function fetchPerspectives() {
    fetch('/get_user_perspectives')
        .then(response => response.json())
        .then(data => {
            if (data.perspectives) {
                updatePerspectivesTable(data.perspectives);
            }
        })
        .catch(error => console.error('Error fetching perspectives:', error));
}

function updatePerspectivesTable(perspectives) {
    const tableBody = document.getElementById('perspectivesTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear existing rows

    Object.keys(perspectives).forEach(key => {
        let row = tableBody.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);

        cell1.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize the key
        cell2.textContent = perspectives[key];
        cell2.setAttribute('data-key', key); // Set a data attribute for identification
        cell3.innerHTML = '<button onclick="editPerspective(this, \'' + key + '\')">Edit</button>';
    });
}

function editPerspective(button, perspectiveKey) {
    let cell = button.parentNode.previousSibling;
    let currentValue = cell.textContent;
    cell.innerHTML = '<input type="text" value="' + currentValue + '">'
                    + '<button onclick="savePerspective(this, \'' + perspectiveKey + '\')">Save</button>';
}

function savePerspective(button, perspectiveKey) {
    let input = button.parentNode.firstChild;
    let newValue = input.value;

    // Send the updated value to the server
    fetch('/update_perspective', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ perspectiveKey, perspectiveValue: newValue }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Perspective updated successfully') {
            // Update the table cell to show the new value
            let cell = button.parentNode;
            cell.textContent = newValue;
        } else {
            console.error('Error updating perspective:', data.error);
        }
    })
    .catch(error => console.error('Error updating perspective:', error));
}
