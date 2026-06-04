const API_URL = "http://localhost:5555";
let results = [];

function displayContactList(data) {
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
  listContainer.querySelector('.contact-item').classList.add('active');
  displayContactDetails(data[0]);
}

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
    displayEditForm(contact);
  })
  detailContainer.append(editButton);
  detailPane.append(detailContainer);
}

function displayEditForm(contact) {
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
      <label class="custom-label">First Name</label>
      <input type="text" class="custom-input" value=${contact.first_name}>
    </div>
    <div class="col-md-6">
      <label class="custom-label">Last Name</label>
      <input type="text" class="custom-input" value=${contact.last_name}>
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
      <button type="button" class="remove-email-btn">
        <i class="fa-solid fa-circle-minus"></i>
      </button>
    `
    emailContainer.append(emailRow);
  })
  const addEmailButton = document.createElement('button');
  addEmailButton.classList.add('add-email-btn');
  addEmailButton.innerHTML = '<i class="fa-solid fa-circle-plus"></i> add email';
  addEmailButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.target.classList.add('hidden');
  })
  emailContainer.append(addEmailButton);
  editForm.append(emailContainer);

  const actionsFooter = document.createElement('div');
  actionsFooter.classList.add('actions-footer');
  const deleteButton = document.createElement('button');
  deleteButton.classList.add('btn', 'btn-delete');
  deleteButton.textContent = 'Delete';
  const cancelButton = document.createElement('button');
  cancelButton.classList.add('btn', 'btn-cancel');
  cancelButton.textContent = 'Cancel';
  const saveButton = document.createElement('button');
  saveButton.classList.add('btn', 'btn-save');
  saveButton.textContent = 'Save';
  actionsFooter.append(deleteButton);
  const innerDiv = document.createElement('div');
  actionsFooter.append(innerDiv);
  innerDiv.append(cancelButton, saveButton);
  editForm.append(actionsFooter);
  formContainer.append(editForm);
  detailPane.append(formContainer);
}

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
  document.querySelector('#loading').textContent = error;
});

document.querySelector('.add-contact-btn').addEventListener('click', (event) => {
  displayEditForm({'first_name':'', 'last_name':'', 'emails': []});
});