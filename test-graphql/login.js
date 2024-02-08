// function login() {
//   const loginButton = document.getElementById("loginButton");

//   loginButton.addEventListener("click", async () => {
//     console.log("click clikc");
//     const email = document.querySelector('input=[name="email"]').value;
//     const password = document.querySelector('input=[name="password"]').value;

//     const graphqlQuery = {
//       query: `
//         userLogin(userInput: {email: "${email}", password: "${password}"}){
//             token
//             userId
//         }
//         `,
//     };

//     try {
//       const res = await fetch("http://localhost:3000/graphql", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(graphqlQuery),
//       });

//       const resData = await res.json();

//       if (resData) {
//         console.log("success");
//         window.location.href = "http://localhost:3000/";
//       }

//       console.log(resData);
//     } catch (err) {
//       console.log("fetch error: ", err);
//     }
//   });
// }

document.getElementById("loginButton").addEventListener("click", () => {
  console.log("click 1");
});
