const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return email.match(emailRegEx);
};
const isName = (name) => {
    const nameRegEx = /^[a-z ,.'-]+$/i;
    return name.match(nameRegEx);
};
const isEmpty = (string) => {
    return string.trim() === '';
};

exports.validateSignup = (data) => {
    let errors = {};

    // Email Validation
    if(isEmpty(data.email)){
        errors.email = 'Email must not be empty';
    } else if (!isEmail(data.email)){
        errors.email = `Must be a valid email address`;
    }
    // Password Validation
    if(isEmpty(data.password)){
        errors.password = 'Password must not be empty';
    }
    // FirstName Validation
    if(isEmpty(data.firstName)){
        errors.firstName = 'First name must not be empty';
    } else if (!isName(data.firstName)) {
        errors.firstName = `Must be a valid name`
    }
    // LastName Validation
    if(isEmpty(data.lastName)){
        errors.lastName = 'Last name must not be empty';
    } else if (!isName(data.lastName)) {
        errors.lastName = `Must be a valid name`
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0,
    }
};

exports.validateLogin = (data) => {
    let errors ={};
    if(isEmpty(data.email)){
        errors.email = 'Email must not be empty';
    }
    if(isEmpty(data.password)){
        errors.password = 'Password must not be empty';
    }
    return {
        errors,
        valid: Object.keys(errors).length === 0,
    }
};

exports.reduceUserDetails = (data) => {
  let userDetails = {};

  if(!isEmpty(data.firstName.trim()) && isName(data.firstName.trim())) userDetails.firstName = data.firstName;
  if(!isEmpty(data.lastName.trim()) && isName(data.lastName.trim())) userDetails.lastName = data.lastName;
  if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio;

  return userDetails;
};