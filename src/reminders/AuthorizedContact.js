import React from 'react';
import PhoneInput from 'react-phone-input-2';

const AuthorizedContact = ({ contact, setContact, handleContactChnage }) => {
    return (
        <div>
            <fieldset>
                <legend>
                    Company Name
                </legend>
                <input type="text" name="companyName" value={contact.companyName} onChange={handleContactChnage} placeholder="Enter Company Name" />
            </fieldset>
            <fieldset>
                <legend>
                    Contact Person
                </legend>
                <input type="text" name="contactPerson" value={contact.contactPerson} onChange={handleContactChnage} placeholder="Enter Contact Person Name" />
            </fieldset>
            <fieldset>
                <legend>
                    E Mail
                </legend>
                <input type="text" name="email" value={contact.email} onChange={handleContactChnage} placeholder="Enter Email" />
            </fieldset>
            <fieldset>
                <legend>
                    Phone Number
                </legend>
                <PhoneInput
                    value={contact.phone}
                    placeholder="Enter Company Phone Number"
                    onChange={p => { setContact({ ...contact, phone: p }); }}
                />
            </fieldset>

        </div>
    );
};

export default AuthorizedContact;