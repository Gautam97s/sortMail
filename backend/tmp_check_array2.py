from sqlalchemy import select, Column, String, func, any_, cast
from sqlalchemy.dialects.postgresql import ARRAY, array
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

try:
    stmt1 = select(Email).where(func.lower(Contact.email_address) == any_(Email.recipients))
    print("any_():", stmt1)
except Exception as e:
    print("any_() failed:", e)

try:
    stmt2 = select(Email).where(Email.recipients.contains(cast(array([func.lower(Contact.email_address)]), ARRAY(String))))
    print("contains with cast:", stmt2)
except Exception as e:
    print("contains with cast failed:", e)
    
try:
    stmt3 = select(Email).where(func.lower(Contact.email_address) == func.any(Email.recipients))
    print("func.any():", stmt3)
except Exception as e:
    print("func.any() failed:", e)
