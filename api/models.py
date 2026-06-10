from marshmallow import Schema, fields

from config import db

class Contact(db.Model):
	__tablename__ = 'contacts'

	id = db.Column(db.Integer, primary_key=True)
	first_name = db.Column(db.String)
	last_name = db.Column(db.String)

	emails = db.relationship('Email', back_populates='contact', cascade='all, delete-orphan')
	
class ContactSchema(Schema):
	id = fields.Int()
	first_name = fields.String()
	last_name = fields.String()
	
	emails = fields.List(fields.Nested(lambda: EmailSchema()))

class Email(db.Model):
	__tablename__ = 'emails'

	id = db.Column(db.Integer, primary_key=True)
	email = db.Column(db.String, nullable=False)

	contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id'))

	contact = db.relationship('Contact', back_populates='emails')

class EmailSchema(Schema):
	id = fields.Int()
	email = fields.String()