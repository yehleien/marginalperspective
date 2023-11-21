document.addEventListener('DOMContentLoaded', function() {
    fetchUserPerspectives();
});

async function fetchUserPerspectives() {
    try {
        // Replace with the correct API endpoint to fetch perspectives
        const response = await fetch('/api/get_perspectives');
        const perspectives = await response.json();

        // Clear existing perspectives
        const tableBody = document.getElementById('perspectiveTableBody');
        tableBody.innerHTML = '';

        // Add each perspective to the table
        perspectives.forEach((perspective, index) => {
            const row = tableBody.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);

            cell1.textContent = perspective.name; // Adjust according to your data structure
            cell2.textContent = perspective.verified ? '✅' : '❌';
            cell3.innerHTML = `<button onclick="deletePerspective(${index})">Delete</button>`;
        });
    } catch (error) {
        console.error('Error fetching perspectives:', error);
    }
}

async function addPerspective() {
    const newPerspective = document.getElementById('newPerspective').value;
    const newPerspective2 = document.getElementById('newPerspective2').value;

    try {
        // Replace with your API endpoint and adjust the body as needed
        const response = await fetch('/api/add_perspective', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ perspectiveKey: newPerspective, perspectiveValue: newPerspective2 })
        });

        if (response.ok) {
            fetchUserPerspectives(); // Refresh the list of perspectives
        } else {
            console.error('Error adding perspective:', await response.text());
        }
    } catch (error) {
        console.error('Error adding perspective:', error);
    }
}

document.getElementById('perspectiveForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const age = document.getElementById('age').value;
    const nationality = document.getElementById('nationality').value;
    const sex = document.getElementById('sex').value;

    try {
        // Replace with your API endpoint and adjust the body as needed
        const response = await fetch('/api/add_perspective', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                age: age, 
                nationality: nationality, 
                sex: sex 
            })
        });

        if (response.ok) {
            fetchUserPerspectives(); // Refresh the list of perspectives
        } else {
            console.error('Error adding perspective:', await response.text());
        }
    } catch (error) {
        console.error('Error adding perspective:', error);
    }
});
