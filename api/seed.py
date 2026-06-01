#!/usr/bin/env python3

from sqlalchemy import text
from random import choice as rc, randrange
from faker import Faker
from config import db, app
from models import *

fake = Faker()

with app.app_context():
	print('Deleting all records...')

	db.session.execute(text('TRUNCATE TABLE contacts RESTART IDENTITY CASCADE; TRUNCATE TABLE emails RESTART IDENTITY CASCADE;')) # deletes all data and resets ids
	
	print('Creating contact names...')
	contacts = []

	for i in range(20):
		contact = Contact(first_name=fake.unique.first_name(), last_name=fake.unique.last_name())
		contacts.append(contact)

	db.session.add_all(contacts)

	print('Creating emails...')
	emails = []

	for contact in contacts:
		for i in range(randrange(1, 4)):
			email = Email(email=fake.unique.email())
			email.contact = contact
			emails.append(email)
	
	db.session.add_all(emails)

	db.session.commit()
	print('Complete')
	db.session.close()