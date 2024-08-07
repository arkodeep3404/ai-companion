import { User } from "@prisma/client";
import axios from "axios";

export default async function getCurrentUser(token: string): Promise<User> {
  let baseUrl;
  if (process.env.ENV === "DEV") {
    baseUrl = "http://localhost:3000";
  } else if (process.env.ENV === "PROD") {
    baseUrl = "https://domain.tld";
  }

  let currentUser: User = {
    id: "",
    email: "",
    token: "",
    firstName: "",
    lastName: "",
  };

  try {
    const response = await axios.get(`${baseUrl}/api/details`, {
      headers: { token: token },
    });
    currentUser = response.data.currentUser;
  } catch (error) {
    console.log("error");
  }

  return currentUser;
}
