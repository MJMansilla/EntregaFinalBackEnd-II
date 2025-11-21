class UserDTO {
  constructor({ _id, first_name, last_name, email, age, role, cart }) {
    this.id = _id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.age = age;
    this.role = role;
    this.cart = cart;
  }
}

module.exports = UserDTO;
