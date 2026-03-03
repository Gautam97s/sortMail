from sqlalchemy import select, Column, String, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Email(Base):
    __tablename__ = 'emails'
    id = Column(String, primary_key=True)
    recipients = Column(ARRAY(String))

class Contact(Base):
    __tablename__ = 'contacts'
    id = Column(String, primary_key=True)
    email_address = Column(String)

stmt1 = select(Email).where(Email.recipients.any(func.lower(Contact.email_address)))
print("stmt1:", stmt1)

stmt2 = select(Email).where(Email.recipients.contains([func.lower(Contact.email_address)]))
print("stmt2:", stmt2)
