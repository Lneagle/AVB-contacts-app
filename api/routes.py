from flask import request, jsonify, make_response
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from config import db
from models import *

class AllContacts(Resource):
	def get(self):
		contacts = Contact.query.all()

		if contacts:
			return [ContactSchema().dump(contact) for contact in contacts], 200
		else:
			return {'errors': ['404 Not Found']}, 404
		
	def post(self):
		request_json = request.get_json()
		if not request_json:
			return {'errors': ['Request body required']}, 400
		
		if 'first_name' not in request_json or 'last_name' not in request_json:
			return {'errors': ['first_name and last_name are required']}, 400
		
		if not isinstance(request_json['first_name'], str) or not request_json['first_name'].strip() or not isinstance(request_json['last_name'], str) or not request_json['last_name'].strip():
			return {'errors': ['first_name and last_name must be non-empty strings']}, 400
		
		try:
			new_contact = Contact(first_name=request_json['first_name'], last_name=request_json['last_name'])
			db.session.add(new_contact)
			db.session.commit()
			return ContactSchema().dump(new_contact), 201
		except IntegrityError as e:
			db.session.rollback()
			return {'errors': ['Database constraint violation']}, 422
		
class ContactById(Resource):
	def get(self, id):
		contact = Contact.query.filter_by(id=id).first()

		if contact:
			return ContactSchema().dump(contact), 200
		else:
			return {'errors': ['404 Not Found']}, 404
		
	def patch(self, id):
		contact = Contact.query.filter_by(id=id).first()

		if not contact:
			return {'errors': ['404 Not Found']}, 404
		else:
			request_json = request.get_json()
			if not request_json:
				return {'errors': ['Request body required']}, 400

			for attr in request_json:
				if attr not in ['first_name', 'last_name']:
					return {'errors': [f'{attr} is not a valid field']}, 403
				setattr(contact, attr, request_json[attr])
			db.session.commit()
			return ContactSchema().dump(contact), 200
		
	def delete(self, id):
		contact = Contact.query.filter_by(id=id).first()

		if not contact:
			return {'errors': ['404 Not Found']}, 404
		else:
			db.session.delete(contact)
			db.session.commit()
			return {}, 204
		
class EmailsByContact(Resource):
	def get(self, contact_id):
		emails = Email.query.filter_by(contact_id=contact_id).all()

		if emails:
			return [EmailSchema().dump(email) for email in emails], 200
		else:
			return {'errors': ['404 Not Found']}, 404
		
	def post(self, contact_id):
		request_json = request.get_json()
		if not request_json:
			return {'errors': ['Request body required']}, 400
		
		if 'email' not in request_json:
			return {'errors': ['email is required']}, 400
		
		if not isinstance(request_json['email'], str) or not request_json['email'].strip():
			return {'errors': ['email must be a non-empty string']}, 400
		
		contact = Contact.query.filter_by(id=contact_id).first()
		if not contact:
			return {'errors': ['Contact not found']}, 404
		
		try:
			new_email = Email(email=request_json['email'])
			new_email.contact = contact
			db.session.add(new_email)
			db.session.commit()
			return EmailSchema().dump(new_email), 201
		except IntegrityError as e:
			db.session.rollback()
			return {'errors': ['Database constraint violation']}, 422
		
class EmailById(Resource):
	def get(self, contact_id, email_id):
		email = Email.query.filter_by(id=email_id).first()

		if email:
			if contact_id != email.contact_id:
				return {'errors': ['403 Forbidden']}, 403 # email does not belong to contact
			return EmailSchema().dump(email), 200
		else:
			return {'errors': ['404 Not Found']}, 404
		
	def patch(self, contact_id, email_id):
		email = Email.query.filter_by(id=email_id).first()

		if not email:
			return {'errors': ['404 Not Found']}, 404
		else:
			if contact_id != email.contact_id:
				return {'errors': ['403 Forbidden']}, 403 # email does not belong to contact
			request_json = request.get_json()
			if not request_json:
				return {'errors': ['Request body required']}, 400

			if 'email' not in request_json:
				return {'errors': ['Request must only contain \'email\' field']}, 403
			setattr(email, 'email', request_json['email'])
			db.session.commit()
			return EmailSchema().dump(email), 200
		
	def delete(self, contact_id, email_id):
		email = Email.query.filter_by(id=email_id).first()

		if not email:
			return {'errors': ['404 Not Found']}, 404
		else:
			if contact_id != email.contact_id:
				return {'errors': ['403 Forbidden']}, 403 # email does not belong to contact
			db.session.delete(email)
			db.session.commit()
			return {}, 204