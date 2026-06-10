const API_URL = "http://localhost:5555";
let results = [];

// Display the list of contacts
function displayContactList(data, index=0) {
  console.log(data);
  document.getElementById('loading').classList.add('hidden');
  const listContainer = document.querySelector('.contact-list');
  data.forEach(element => {
    const contactLink = document.createElement('a');
    contactLink.classList.add('contact-item');
    contactLink.textContent = `${element.first_name} ${element.last_name}`;
    contactLink.addEventListener('click', (event) => {
      event.preventDefault();
      document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
      });
      event.target.classList.add('active');
      displayContactDetails(element);
    })
    listContainer.append(contactLink);
  });
  listContainer.querySelectorAll('.contact-item')[index].classList.add('active');
  displayContactDetails(data[index]);
}

// Display details for a contact with an edit button
function displayContactDetails(contact) {
  const detailPane = document.querySelector('.details-pane');
  detailPane.innerHTML = '';
  const detailContainer = document.createElement('div');
  detailContainer.classList.add('contact-details');
  const contactName = document.createElement('h3');
  contactName.textContent = `${contact.first_name} ${contact.last_name}`;
  detailContainer.append(contactName);
  if (contact.emails) {
    const heading = document.createElement('h4');
    heading.textContent = 'Emails';
    detailContainer.append(heading);
    contact.emails.forEach(email => {
      const row = document.createElement('p');
      const contactEmail = document.createElement('a');
      contactEmail.textContent = `${email.email}`;
      contactEmail.href = `mailto:${email.email}`;
      row.append(contactEmail);
      detailContainer.append(row);
    });
  }
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.classList.add('btn', 'btn-edit');
  editButton.addEventListener('click', (event) => {
    displayEditForm(contact, false);
  })
  detailContainer.append(editButton);
  detailPane.append(detailContainer);
}

// Display the edit form for a new or existing contact
function displayEditForm(contact, isNew) {
  const actions = [];
  const detailPane = document.querySelector('.details-pane');
  detailPane.innerHTML = '';
  const formContainer = document.createElement('div');
  formContainer.classList.add('form-container');
  const editForm = document.createElement('form');
  editForm.id = 'contact-edit-form';

  const nameRow = document.createElement('div');
  nameRow.classList.add('row', 'g-4');
  nameRow.innerHTML = `
    <div class="col-md-6">
      <label class="custom-label" for="first-name">First Name</label>
      <input type="text" class="custom-input" id="first-name" value=${contact.first_name}>
    </div>
    <div class="col-md-6">
      <label class="custom-label" for="last-name">Last Name</label>
      <input type="text" class="custom-input" id="last-name" value=${contact.last_name}>
    </div>
  `;
  editForm.append(nameRow);

  const emailContainer = document.createElement('div');
  emailContainer.classList.add('email-list-container');
  emailContainer.innerHTML = '<label class="custom-label">Email</label>';
  contact.emails.forEach(email => {
    const emailRow = document.createElement('div');
    emailRow.classList.add('email-row');
    emailRow.innerHTML = `
      <span class="email-text">${email.email}</span>
    `
    const emailDeleteButton = document.createElement('button');
    emailDeleteButton.classList.add('remove-email-btn');
    emailDeleteButton.innerHTML = '<i class="fa-solid fa-circle-minus"></i>';
    emailDeleteButton.addEventListener('click', (event) => {
      event.preventDefault();
      actions.push(['-', email.id]);
      event.currentTarget.parentElement.remove();
    })
    emailRow.append(emailDeleteButton);
    emailContainer.append(emailRow);
  })
  const addEmailButton = document.createElement('button');
  addEmailButton.classList.add('add-email-btn');
  addEmailButton.innerHTML = '<i class="fa-solid fa-circle-plus"></i> add email';
  addEmailButton.addEventListener('click', (event) => {
    event.preventDefault();
    addEmailButton.classList.add('hidden');
    const newEmail = document.createElement('div')
    newEmail.innerHTML = '<input type="text" id="email-input">';
    const saveEmail = document.createElement('button');
    saveEmail.classList.add('btn-email-save');
    saveEmail.textContent = 'Save Email';
    saveEmail.addEventListener('click', (event) => {
      event.preventDefault();
      if (!isNew) {
        actions.push(['+', document.querySelector('#email-input').value]);
      }
      const emailRow = document.createElement('div');
      emailRow.classList.add('email-row');
      emailRow.innerHTML = `
        <span class="email-text">${document.querySelector('#email-input').value}</span>
      `
      addEmailButton.before(emailRow);
      newEmail.remove();
      addEmailButton.classList.remove('hidden');
    });
    newEmail.append(saveEmail);
    addEmailButton.before(newEmail);
  });
  emailContainer.append(addEmailButton);
  editForm.append(emailContainer);

  const actionsFooter = document.createElement('div');
  actionsFooter.classList.add('actions-footer');

  if (!isNew) {
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn', 'btn-delete');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', (event) => {
      event.preventDefault();
      deleteContact(contact.id);
    });
    actionsFooter.append(deleteButton);
  }

  const cancelButton = document.createElement('button');
  cancelButton.classList.add('btn', 'btn-cancel');
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (isNew) {
      displayContactDetails(results[0]);
    } else {
      displayContactDetails(contact);
    }
  });

  const saveButton = document.createElement('button');
  saveButton.classList.add('btn', 'btn-save');
  saveButton.textContent = 'Save';
  saveButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (isNew) {
      const contactToSend = JSON.stringify({
        "first_name": document.getElementById('first-name').value,
        "last_name": document.getElementById('last-name').value,
        "emails": Array.from(document.querySelectorAll('.email-text')).map(el => el.textContent)
      });
      addContact(contactToSend);
    } else {
      const newName = {};
      const firstName = document.getElementById('first-name').value;
      const lastName = document.getElementById('last-name').value;
      if (contact.first_name != firstName) {
        newName['first_name'] = firstName;
      }
      if (contact.last_name != lastName) {
        newName['last_name'] = lastName;
      }
      if (Object.keys(newName).length > 0) {
        actions.push(['name', newName]);
      }
      console.log(actions);
      handleSave(contact.id, actions);
    }
  });

  const innerDiv = document.createElement('div');
  actionsFooter.append(innerDiv);
  innerDiv.append(cancelButton, saveButton);
  editForm.append(actionsFooter);
  formContainer.append(editForm);
  detailPane.append(formContainer);
}

// Add a new contact
const addContact = async(body) => {
  try {
    const response = await fetch(`${API_URL}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    if (!response.ok) {
      throw new Error('Could not create contact');
    }
    const listContainer = document.querySelector('.contact-list');
    listContainer.innerHTML = '<p id="loading">Loading...</p>';
    const data = await response.json();
    const index = results.findIndex(item => item.last_name.toUpperCase() > data.last_name.toUpperCase())
    if (index == -1) {
      index == results.length;
    }
    results.splice(index, 0, data);
    displayContactList(results, index);
  } catch (error) {
    document.querySelector('#loading').textContent = error.message;
  }
}

// Delete contact
const deleteContact = async(contactId) => {
  try {
    const response = await fetch(`${API_URL}/contacts/${contactId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error('Could not delete contact');
    }
    const listContainer = document.querySelector('.contact-list');
    listContainer.innerHTML = '<p id="loading">Loading...</p>';
    const index = results.findIndex(item => item.id == contactId)
    results.splice(index, 1);
    displayContactList(results);
  } catch (error) {
    document.querySelector('#loading').classList.remove('hidden');
    document.querySelector('#loading').textContent = error.message;
  }
}

function handleSave(contactId, actions) {
  const resultsIndex = results.findIndex(el => el.id == contactId);
  const promises = actions.map((action) => {
    if(action[0] == '+') {
      const email = action[1];
      return fetch(`${API_URL}/contacts/${contactId}/emails`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        "email": email
        }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not add email`);
        } else {
          return response.json();
        }
      })
      .catch(error => {
        console.error('Error:', error)
        throw error;
      });
	  } else if (action[0] == '-') {
      const emailId = action[1];
        return fetch(`${API_URL}/contacts/${contactId}/emails/${emailId}`, {
        method: "DELETE",
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not delete email`);
        }
      })
      .catch (error => {
        console.error('Error:', error);
        throw error;
      });
    } else if (action[0] == 'name') {
      const nameBody = action[1];
      return fetch(`${API_URL}/contacts/${contactId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nameBody),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not update contact name`);
        }
      })
      .catch (error => {
        console.error("Error:", error);
        throw error;
      });
    }
  });

  Promise.all(promises)
  .then((values) => {
    actions.forEach((action, index) => {
      if(action[0] == '+') {
        results[resultsIndex].emails.push(values[index]);
      } else if (action[0] == '-') {
        const emailId = action[1];
        results[resultsIndex].emails.splice(results[resultsIndex].emails.findIndex(el => el.id == emailId), 1);
      } else if (action[0] == 'name') {
        const newName = action[1];
        console.log(newName);
        console.log(newName.first_name);
        if (newName.first_name) {
          results[resultsIndex].first_name = newName.first_name;
        }
        if (newName.last_name) {
          results[resultsIndex].last_name = newName.last_name;
        }
        document.querySelector('.contact-item.active').textContent = `${results[resultsIndex].first_name} ${results[resultsIndex].last_name}`;
      }
    });
    displayContactDetails(results[resultsIndex]);
  });
}



/* Main */

// Get contact list from backend
fetch(`${API_URL}/contacts`)
.then(response => response.json())
.then(data => {
  results = data;
  results.sort((a, b) => {
    const lastNameA = a.last_name.toUpperCase(); // ignore upper and lowercase
    const lastNameB = b.last_name.toUpperCase(); // ignore upper and lowercase
    if (lastNameA < lastNameB) {
      return -1;
    }
    if (lastNameA > lastNameB) {
      return 1;
    }
    const firstNameA = a.first_name.toUpperCase();
    const firstNameB = b.first_name.toUpperCase();
    if (firstNameA < firstNameB) {
      return -1;
    }
    if (firstNameA > firstNameB) {
      return 1;
    }
    // names must be equal
    return 0;
  })
  displayContactList(results);
})
.catch(error => {
  console.error(error)
  document.querySelector('#loading').textContent = error.message;
});

// Event Listener for Add Contact button
document.querySelector('.add-contact-btn').addEventListener('click', (event) => {
  displayEditForm({'first_name':'', 'last_name':'', 'emails': []}, true);
});