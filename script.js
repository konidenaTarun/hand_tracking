const signUpBtn = document.getElementById("signUp");
const signInBtn = document.getElementById("signIn");
const container = document.getElementById("container");

signUpBtn.addEventListener("click", () => {
  container.classList.add("active");
});

signInBtn.addEventListener("click", () => {
  container.classList.remove("active");
});
