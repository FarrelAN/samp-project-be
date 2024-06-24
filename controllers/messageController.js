import dotenv from "dotenv";
import https from "https";
dotenv.config();

const user = process.env.USER || "9e254dd5";
const password = process.env.PASSWORD || "pqdUMNRUgVhKFn3w";
const from_number = process.env.FROM_NUM || "14157386102";

const sendMessage = (req, res) => {
  const { to_number, message } = req.body;

  console.log(user, password, from_number);

  const data = JSON.stringify({
    from: { type: "whatsapp", number: from_number },
    to: { type: "whatsapp", number: to_number },
    message: {
      content: {
        type: "text",
        text: message,
      },
    },
  });

  const options = {
    hostname: "messages-sandbox.nexmo.com",
    port: 443,
    path: "/v0.1/messages",
    method: "POST",
    auth: `${user}:${password}`,
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${user}:${password}`).toString("base64"),
      "Content-Type": "application/json",
    },
  };

  const reqApi = https.request(options, (resApi) => {
    let responseData = "";

    resApi.on("data", (chunk) => {
      responseData += chunk;
    });

    resApi.on("end", () => {
      const parsedData = JSON.parse(responseData);
      if (resApi.statusCode === 202) {
        res
          .status(200)
          .send({ message: "Message sent successfully", data: parsedData });
      } else {
        res
          .status(resApi.statusCode)
          .send({ message: "Failed to send message", data: parsedData });
      }
    });
  });

  reqApi.on("error", (e) => {
    console.error(e);
    res.status(500).send("Internal Server Error");
  });

  reqApi.write(data);
  reqApi.end();
};

export default sendMessage;
