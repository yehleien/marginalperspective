// perspective-platform/account.js
const perspectiveTypes = ['Default', 'Custom', 'AnotherType', 'custom'];

async function fetchAndDisplayUsername() {
    try {
        const response = await fetch('/account/current', {
            credentials: 'include' // include credentials to send the session cookie
        });
        const user = await response.json();
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.textContent = 'Welcome, ' + user.username + '!';
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchAndDisplayPerspectives() {
    try {
        // Fetch the current user to get the userId
        const userResponse = await fetch('/account/current', {
            credentials: 'include' // include credentials to send the session cookie
        });
        const user = await userResponse.json();
        const userId = user.id;

        // Fetch the user's perspectives by matching UserPerspective with Perspective
        const response = await fetch(`/UserPerspective/get_user_perspectives/${userId}`, {
            credentials: 'include' // include credentials to send the session cookie
        });
        const userPerspectives = await response.json();
        const perspectivesBody = document.getElementById('perspectivesBody');
        perspectivesBody.innerHTML = userPerspectives.map(userPerspective => `
            <tr>
                <td>${userPerspective.perspectiveName}</td>
                <td>${new Date(userPerspective.updatedAt).toLocaleString()}</td>
                <td>${userPerspective.type}</td>
                <td>
                    <button onclick="showUpdateForm(${userPerspective.perspectiveId}, '${userPerspective.perspectiveName}', '${userPerspective.type}')">Update</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const updateForm = document.getElementById('updatePerspectiveForm');
    if (updateForm) {
        updateForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const perspectiveId = document.getElementById('updatePerspectiveId').value;
            const name = document.getElementById('updatePerspectiveName').value;
            const type = document.getElementById('updatePerspectiveType').value;

            if (!perspectiveId) {
                console.error('Error: Perspective ID is undefined');
                return;
            }

            updatePerspective(perspectiveId, name, type);
        });
    } else {
        console.error('Error: updatePerspectiveForm does not exist in the DOM.');
    }
});

// Function to update a perspective with type
async function updatePerspective(perspectiveId, perspectiveName, perspectiveType) {
    try {
        const response = await fetch('/perspectives/update_perspective/' + perspectiveId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ perspectiveName, perspectiveType }) // Ensure both name and type are included in the body
        });
        const data = await response.json();
        if (data.success) {
            // Refresh the perspectives list
            fetchAndDisplayPerspectives();
        } else {
            // Display an error message
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

window.onload = function() {
    fetchAndDisplayUsername();
    fetchAndDisplayPerspectives();
};

// Show the update form with the current perspective name and type
function showUpdateForm(perspectiveId, name, type) {
    const updateIdElement = document.getElementById('updatePerspectiveId');
    const updateNameElement = document.getElementById('updatePerspectiveName');
    const typeDropdown = document.getElementById('updatePerspectiveType');

    if (updateIdElement && updateNameElement && typeDropdown) {
        updateIdElement.value = perspectiveId;
        updateNameElement.value = name;
        // Ensure the dropdown is set to the correct value
        typeDropdown.value = type; // This should correctly set the dropdown to the current type

        document.getElementById('updatePerspectiveForm').style.display = 'block';
    } else {
        console.error('One or more elements do not exist in the DOM.');
    }
}

// Create perspective Dropdown menu
function createDropdown(options, dropdownId) {
    const select = document.createElement('select');
    select.id = dropdownId;
    select.name = dropdownId;
  
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1); // Capitalize the first letter
      select.appendChild(optionElement);
    });
  
    return select;
  }
  
  // Assuming 'perspectiveTypes' is an array of perspective types and 'perspectiveTypeDropdown' is the ID of the div where the dropdown should be appended
  document.addEventListener('DOMContentLoaded', () => {
    const dropdown = createDropdown(perspectiveTypes, 'updatePerspectiveType');
    document.getElementById('perspectiveTypeDropdown').appendChild(dropdown);
  });

// Handle the update form submission
document.getElementById('updatePerspectiveForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const perspectiveId = document.getElementById('updatePerspectiveId').value;
    const name = document.getElementById('updatePerspectiveName').value;
    const type = document.getElementById('updatePerspectiveType').value; // Get the selected type from the dropdown

    if (!perspectiveId) {
        console.error('Error: Perspective ID is undefined');
        return;
    }

    updatePerspective(perspectiveId, name, type); // Pass the type to the update function
});
document.getElementById('addPerspectiveButton').addEventListener('click', async function() {
    const perspectivesTable = document.getElementById('perspectivesTable');
    const row = perspectivesTable.insertRow();

    // Create a cell for the perspective type dropdown
    const typeCell = row.insertCell();
    const typeSelect = document.createElement('select');
    typeCell.appendChild(typeSelect);

    // Fetch and populate perspective types
    try {
        const response = await fetch('/perspectives/get_all_perspectives');
        const perspectiveTypes = await response.json();
        perspectiveTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.perspectiveId; // Assuming each type has a unique ID
            option.textContent = type.perspectiveName; // Assuming the name of the perspective type is what you want to display
            typeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching perspective types:', error);
    }

    // Create a cell for the "Save" button
    const saveCell = row.insertCell();
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', async function() {
        const selectedPerspectiveId = typeSelect.value; // Get the selected perspective type

        // Fetch the current user to get the userId
        const userResponse = await fetch('/account/current', {
            credentials: 'include' // include credentials to send the session cookie
        });
        const user = await userResponse.json();
        const userId = user.id;

        // Add the new perspective to the database
        const response = await fetch('/UserPerspective/add_user_perspective', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ perspectiveId: selectedPerspectiveId, userId }) // Include userId and selected perspective type here
        });

        const data = await response.json();

        if (data.success) {
            // Refresh the perspectives list
            fetchAndDisplayPerspectives();
        } else {
            // Display an error message
            console.error('Error:', data.error);
        }
    });
    saveCell.appendChild(saveButton);
});


