export const signupRequest = (
  email = "test@test.com",
  password = "password123",
) => {
  return new Request("http://localhost:3000/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const loginRequest = (
  email = "test@test.com",
  password = "password123",
) => {
  return new Request("http://localhost:3000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const logoutRequest = () => {
  return new Request("http://localhost:3000/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
