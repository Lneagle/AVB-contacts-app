#!/usr/bin/env python3

from config import app, db, api
from routes import *

api.add_resource(AllContacts, '/contacts', endpoint='/contacts')
api.add_resource(ContactById, '/contacts/<int:id>', endpoint='/contacts/<int:id>')
api.add_resource(EmailsByContact, '/contacts/<int:contact_id>/emails', endpoint='/contacts/<int:contact_id>/emails')
api.add_resource(EmailById, '/contacts/<int:contact_id>/emails/<int:email_id>', endpoint='/contacts/<int:contact_id>/emails/<int:email_id>')

if __name__ == '__main__':
  app.run(port=5555, debug=True)